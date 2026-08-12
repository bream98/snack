package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// MessageEvent represents a generic event transferred over WebSocket / Kafka / Redis
type MessageEvent struct {
	Type     string `json:"type"`      // e.g. "chat_message", "hello_world"
	ClientID string `json:"client_id"` // ID of the targeted client or sender
	Payload  string `json:"payload"`   // Message content
	NodeID   string `json:"node_id"`   // Node handling the connection
}

// Client represents a single active WebSocket connection
type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
}

// Hub maintains the set of active clients and broadcasts messages to them
type Hub struct {
	clients    map[string]*Client
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			log.Printf("[Hub] Client registered: %s", client.ID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
				log.Printf("[Hub] Client unregistered: %s", client.ID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			var event MessageEvent
			if err := json.Unmarshal(message, &event); err == nil && event.ClientID != "" {
				// Direct message to a specific client connected to this hub
				h.mu.RLock()
				if client, ok := h.clients[event.ClientID]; ok {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.clients, client.ID)
					}
				}
				h.mu.RUnlock()
			} else {
				// Broadcast to all clients on this hub
				h.mu.RLock()
				for id, client := range h.clients {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.clients, id)
					}
				}
				h.mu.RUnlock()
			}
		}
	}
}

func (h *Hub) Register(c *Client) {
	h.register <- c
}

func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}

func (h *Hub) Broadcast(msg []byte) {
	h.broadcast <- msg
}
