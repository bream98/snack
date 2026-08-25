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
}

func NewManager() *Manager {
	return &Manager{
		Client:     make(map[string]*Client),
		Users:      make(map[uint]map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan []byte),
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
			delete(m.Users[client.UserId], client.ClientID)
			if userClients, ok := m.Users[client.UserId]; ok {
				delete(userClients, client.ClientID)

				if len(userClients) == 0 {
					delete(m.Users, client.UserId)
				}
			}
			close(client.Send)
			m.mu.Unlock()

		case msg := <-m.Broadcast:
			fmt.Printf("Broadcasting message: %s\n", msg)
			for _, client := range m.Client {
				select {
				case client.Send <- msg:
					continue
				default:
					delete(m.Client, client.ClientID)
					if userClients, ok := m.Users[client.UserId]; ok {
						delete(userClients, client.ClientID)

						if len(userClients) == 0 {
							delete(m.Users, client.UserId)
						}
					}
					close(client.Send)
				}
			}
		}

	}
}

func (m *Manager) GetClientByUserid(id uint) map[string]*Client {
	if clients, ok := m.Users[id]; ok {
		return clients
	}

	return make(map[string]*Client)
}
