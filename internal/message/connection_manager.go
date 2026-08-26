package message

import (
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	ClientID string
	Conn     *websocket.Conn
	Send     chan []byte
	UserId   uint
}

type Manager struct {
	Client     map[string]*Client
	Users      map[uint]map[string]*Client
	mu         sync.RWMutex
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan []byte

	// pubsub pattern: topic -> clients
	Broker map[string]map[string]*Client
}

func NewManager() *Manager {
	return &Manager{
		Client:     make(map[string]*Client),
		Users:      make(map[uint]map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan []byte),
		Broker:     make(map[string]map[string]*Client),
		mu:         sync.RWMutex{},
	}
}

func NewUser(conn *websocket.Conn, userId uint) (*Client, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	return &Client{
		ClientID: id.String(),
		Conn:     conn,
		Send:     make(chan []byte, 256),
		UserId:   userId,
	}, nil
}

func (m *Manager) Run() {
	for {
		select {
		case client := <-m.Register:
			m.mu.Lock()
			m.Client[client.ClientID] = client

			if m.Users[client.UserId] == nil {
				m.Users[client.UserId] = make(map[string]*Client)
			}

			m.Users[client.UserId][client.ClientID] = client

			m.mu.Unlock()

		case client := <-m.Unregister:
			m.mu.Lock()
			delete(m.Client, client.ClientID)

			if userClients, ok := m.Users[client.UserId]; ok {
				delete(userClients, client.ClientID)

				if len(userClients) == 0 {
					delete(m.Users, client.UserId)
				}
			}

			// ✅ Xóa client khỏi tất cả các Topic trong Broker khi Unregister
			for topic, clients := range m.Broker {
				delete(clients, client.ClientID)
				if len(clients) == 0 {
					delete(m.Broker, topic)
				}
			}

			close(client.Send)
			m.mu.Unlock()

		case msg := <-m.Broadcast:
			fmt.Printf("Broadcasting message: %s\n", msg)
			m.mu.Lock()
			for id, client := range m.Client {
				select {
				case client.Send <- msg:
					continue
				default:
					delete(m.Client, id)
					if userClients, ok := m.Users[client.UserId]; ok {
						delete(userClients, id)

						if len(userClients) == 0 {
							delete(m.Users, client.UserId)
						}
					}
					// Xóa client khỏi Broker
					for topic, clients := range m.Broker {
						delete(clients, id)
						if len(clients) == 0 {
							delete(m.Broker, topic)
						}
					}
					close(client.Send)
				}
			}
			m.mu.Unlock()
		}

	}
}

func (m *Manager) JoinTopic(topic string, client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if clients, ok := m.Broker[topic]; !ok {
		m.Broker[topic] = map[string]*Client{client.ClientID: client}
	} else {
		clients[client.ClientID] = client
	}
}

func (m *Manager) LeaveTopic(clientId string, topic string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if clients, ok := m.Broker[topic]; ok {
		delete(clients, clientId)
		if len(clients) == 0 {
			delete(m.Broker, topic)
		}
	}
}

// BroadcastTopic send a message to all clients in topic
// Only clients in this ws node
func (m *Manager) BroadcastTopic(topic string, msg []byte) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if clients, ok := m.Broker[topic]; ok {
		for _, client := range clients {
			select {
			case client.Send <- msg:
			default:
				// Nếu channel bị nghẽn
			}
		}
	}
}

func (m *Manager) GetClientByUserid(id uint) map[string]*Client {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if clients, ok := m.Users[id]; ok {
		return clients
	}

	return make(map[string]*Client)
}
