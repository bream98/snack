package websocket

import (
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type User struct {
	ClientID string
	Conn     *websocket.Conn
	Send     chan []byte
	UserId   uint
}

type Manager struct {
	Users      map[string]*User
	mu         sync.RWMutex
	Register   chan *User
	Unregister chan *User
	Broadcast  chan []byte
}

func NewManager() *Manager {
	return &Manager{
		Users:      make(map[string]*User),
		Register:   make(chan *User),
		Unregister: make(chan *User),
		Broadcast:  make(chan []byte),
		mu:         sync.RWMutex{},
	}
}

func NewUser(conn *websocket.Conn, userId uint) (*User, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	return &User{
		ClientID: id.String(),
		Conn:     conn,
		Send:     make(chan []byte, 256),
		UserId:   userId,
	}, nil
}

func (m *Manager) Run() {
	for {
		select {
		case user := <-m.Register:
			m.mu.Lock()
			m.Users[user.ClientID] = user
			m.mu.Unlock()

		case user := <-m.Unregister:
			m.mu.Lock()
			delete(m.Users, user.ClientID)
			close(user.Send)
			m.mu.Unlock()

		case msg := <-m.Broadcast:
			fmt.Printf("Broadcasting message: %s\n", msg)
			for _, user := range m.Users {
				select {
				case user.Send <- msg:
					continue
				default:
					delete(m.Users, user.ClientID)
					close(user.Send)
				}
			}
		}

	}
}
