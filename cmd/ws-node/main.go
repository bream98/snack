package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"snack/internal/api"
	"time"

	"snack/internal/db"
	ws "snack/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

const ConnectionDeadline = 30 * time.Second
const PingPeriod = 10 * time.Second

func main() {
	nodeID := getEnv("NODE_ID", "node-1")
	port := getEnv("PORT", "8080")
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	postgresDSN := getEnv("POSTGRES_DSN", "host=localhost user=snack password=snackpassword dbname=snackdb port=5432 sslmode=disable")

	// 1. Initialize PostgreSQL Database via GORM (Connection only)
	var gormDB *gorm.DB
	var err error
	for i := 0; i < 5; i++ {
		gormDB, err = db.InitDB(postgresDSN)
		if err == nil {
			break
		}
		log.Printf("[%s] PostgreSQL connection retry %d/5: %v", nodeID, i+1, err)
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Printf("[%s] Warning: Running without PostgreSQL DB connection (%v)", nodeID, err)
	} else {
		_ = gormDB
	}

	// 2. Setup Redis Client
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	ctx := context.Background()

	// 5. Initialize Gin Engine Web Routes
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Server RESTs Api
	api.Register(r, gormDB)

	// Health Check Route
	r.GET("/health", func(c *gin.Context) {
		c.String(http.StatusOK, "OK from %s", nodeID)
	})

	// Start WebSocket Manager
	manager := ws.NewManager()
	go manager.Run()

	// 4. Subscribe to Redis PubSub (Listen for responses from Workers)
	go listenRedisPubSub(ctx, rdb, manager, nodeID)

	// WebSocket Endpoint
	r.GET("/ws", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

		if err != nil {
			log.Printf("[%s] WS Upgrade error: %v", nodeID, err)
			return
		}
		userId := 1
		user, err := ws.NewUser(conn, uint(userId))
		if err != nil {
			_ = conn.Close()
			return
		}
		manager.Register <- user

		go readPump(ctx, rdb, user, manager)
		go writePump(user, manager)
	})

	log.Fatal(r.Run(":" + port))
}

func readPump(ctx context.Context, rdb *redis.Client, user *ws.User, manager *ws.Manager) {
	defer func() {
		log.Printf("Client disconnected")
		manager.Unregister <- user
		_ = user.Conn.Close()
	}()

	_ = user.Conn.SetReadDeadline(time.Now().Add(ConnectionDeadline))
	user.Conn.SetPongHandler(func(string) error {
		_ = user.Conn.SetReadDeadline(time.Now().Add(ConnectionDeadline))
		return nil
	})

	for {
		_, p, err := user.Conn.ReadMessage()
		if err != nil {
			return
		}

		err = rdb.Publish(ctx, "channel1", p).Err()
		if err != nil {
			return
		}
	}
}

func writePump(user *ws.User, manager *ws.Manager) {
	ticker := time.NewTicker(PingPeriod)

	defer func() {
		ticker.Stop()
		_ = user.Conn.Close()
	}()

	greater := fmt.Sprintf("Welcome Client %s", user.ClientID)
	err := user.Conn.WriteMessage(websocket.TextMessage, []byte(greater))
	if err != nil {
		return
	}

	for {
		select {
		case p := <-user.Send:
			fmt.Printf("Sending message: %s\n", p)
			err := user.Conn.WriteMessage(websocket.TextMessage, p)
			if err != nil {
				return
			}

		case <-ticker.C:
			err := user.Conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(ConnectionDeadline))
			if err != nil {
				return
			}
		}
	}
}

func listenRedisPubSub(ctx context.Context, rdb *redis.Client, manager *ws.Manager, nodeID string) {
	pubsub := rdb.Subscribe(ctx, "channel1")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		log.Printf("[%s] Redis PubSub received: %s", nodeID, msg.Payload)
		manager.Broadcast <- []byte(msg.Payload)
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
