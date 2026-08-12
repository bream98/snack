package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	ws "snack/internal/websocket"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	nodeID := getEnv("NODE_ID", "node-1")
	port := getEnv("PORT", "8080")
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	kafkaAddr := getEnv("KAFKA_ADDR", "localhost:9092")

	log.Printf("[%s] Starting WebSocket Node on port :%s", nodeID, port)

	// 1. Setup Redis Client
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	ctx := context.Background()

	// 2. Setup Kafka
	kafkaWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaAddr),
		Topic:    "chat-events",
		Balancer: &kafka.LeastBytes{},
	}

	// 3. Setup WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()

	// 4. Subscribe to Redis PubSub (Listen for responses from Workers)
	go listenRedisPubSub(ctx, rdb, hub, nodeID)

	// 5. HTTP & WebSocket Route
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK from %s", nodeID)
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[%s] WS Upgrade error: %v", nodeID, err)
			return
		}

		clientID := r.URL.Query().Get("client_id")
		if clientID == "" {
			clientID = fmt.Sprintf("client-%d", time.Now().UnixNano())
		}

		client := &ws.Client{
			ID:   clientID,
			Conn: conn,
			Send: make(chan []byte, 256),
		}

		hub.Register(client)

		// Record connection in Redis Hub (Client -> Node mapping)
		rdb.HSet(ctx, "ws_clients", clientID, nodeID)

		// Send Welcome Hello World Event
		welcomeMsg, _ := json.Marshal(ws.MessageEvent{
			Type:     "welcome",
			ClientID: clientID,
			Payload:  fmt.Sprintf("Hello World from WS Backend %s!", nodeID),
			NodeID:   nodeID,
		})
		client.Send <- welcomeMsg

		// Read loop & Write loop
		go readPump(client, hub, kafkaWriter, nodeID, rdb)
		go writePump(client, hub, rdb, nodeID)
	})

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func readPump(c *ws.Client, hub *ws.Hub, kw *kafka.Writer, nodeID string, rdb *redis.Client) {
	defer func() {
		rdb.HDel(context.Background(), "ws_clients", c.ID)
		hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		log.Printf("[%s] Received from client [%s]: %s", nodeID, c.ID, string(message))

		// Construct Kafka Event
		event := ws.MessageEvent{
			Type:     "chat_message",
			ClientID: c.ID,
			Payload:  string(message),
			NodeID:   nodeID,
		}
		eventBytes, _ := json.Marshal(event)

		// Produce event to Kafka for Worker to process
		err = kw.WriteMessages(context.Background(), kafka.Message{
			Key:   []byte(c.ID),
			Value: eventBytes,
		})
		if err != nil {
			log.Printf("[%s] Kafka produce error: %v", nodeID, err)
		}
	}
}

func writePump(c *ws.Client, hub *ws.Hub, rdb *redis.Client, nodeID string) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func listenRedisPubSub(ctx context.Context, rdb *redis.Client, hub *ws.Hub, nodeID string) {
	pubsub := rdb.Subscribe(ctx, "ws-outbound")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		log.Printf("[%s] Redis PubSub received: %s", nodeID, msg.Payload)
		hub.Broadcast([]byte(msg.Payload))
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
