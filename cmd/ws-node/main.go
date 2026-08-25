package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"snack/internal/repo"
	"snack/internal/rest_api"
	"strings"
	"time"

	"snack/internal/db"
	ws "snack/internal/message"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	Subprotocols:    []string{"access_token"},
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
	rest_api.Register(r, gormDB)

	// Health Check Route
	r.GET("/health", func(c *gin.Context) {
		c.String(http.StatusOK, "OK from %s", nodeID)
	})

	// Start WebSocket Manager
	manager := ws.NewManager()
	go manager.Run()

	// 4. Subscribe to Redis PubSub for peer chat
	peerRedisPubsub := &ws.RedisService{RedisDb: rdb, Ctx: ctx, Manager: manager}
	go peerRedisPubsub.ListenForMessages()

	// Subscribe to Redis PubSub for channel chat
	channelRedisPubsub := &ws.ChannelPubsub{Rdb: rdb, Ctx: ctx}
	go channelRedisPubsub.ListenForMessages()

	// Create object to handle WebSocket connections
	userRepo := &repo.UserRepo{Db: gormDB}
	directChannelRepo := &repo.DirectChannelRepo{Db: gormDB}
	peerService := &ws.PeerService{
		Db:                gormDB,
		UserRepo:          userRepo,
		DirectChannelRepo: directChannelRepo,
		RedisService:      peerRedisPubsub,
	}

	// Create channel service
	channelService := &ws.ChannelService{}

	// WebSocket Read Processor to handle incoming messages
	wsReadProcessor := &ws.WsReadProcessor{PeerService: peerService, ChannelService: channelService}

	// WebSocket Endpoint with Subprotocol Auth Support
	r.GET("/ws", func(c *gin.Context) {
		// Check jwt token
		authClaims, err := ws.CheckToken(c)
		if err != nil {
			log.Printf("[%s] WS Auth failed: %v", nodeID, err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		responseHeader := make(http.Header)
		if sub := c.Request.Header.Get("Sec-WebSocket-Protocol"); sub != "" {
			parts := strings.Split(sub, ",")
			if len(parts) > 0 {
				responseHeader.Set("Sec-WebSocket-Protocol", strings.TrimSpace(parts[0]))
			}
		}

		// Upgrade to WebSocket protocol
		conn, err := upgrader.Upgrade(c.Writer, c.Request, responseHeader)
		if err != nil {
			log.Printf("[%s] WS Upgrade error: %v", nodeID, err)
			return
		}

		// Create new client for manager
		client, err := ws.NewUser(conn, authClaims.UserID)
		if err != nil {
			_ = conn.Close()
			return
		}
		manager.Register <- client

		// Start goroutines for handling messages
		go readPump(ctx, client, manager, wsReadProcessor)
		go writePump(client, manager)
	})

	log.Fatal(r.Run(":" + port))
}

func readPump(
	ctx context.Context,
	user *ws.Client,
	manager *ws.Manager,
	wsReadProcessor *ws.WsReadProcessor,
) {
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

		wsReadProcessor.Handle(user, p)
	}
}

func writePump(user *ws.Client, manager *ws.Manager) {
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

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
