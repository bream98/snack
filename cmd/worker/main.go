package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	ws "snack/internal/message"

	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

func main() {
	workerID := getEnv("WORKER_ID", "worker-1")
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	kafkaAddr := getEnv("KAFKA_ADDR", "localhost:9092")

	log.Printf("[%s] Starting Kafka Worker Listener...", workerID)

	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	ctx := context.Background()

	kafkaReader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{kafkaAddr},
		Topic:    "chat-events",
		GroupID:  "messaging-worker-group",
		MinBytes: 10,
		MaxBytes: 10 * 1024 * 1024,
		MaxWait:  1 * time.Second,
	})
	defer kafkaReader.Close()

	for {
		m, err := kafkaReader.ReadMessage(ctx)
		if err != nil {
			log.Printf("[%s] Error reading Kafka message: %v", workerID, err)
			time.Sleep(2 * time.Second)
			continue
		}

		var event ws.MessageEvent
		if err := json.Unmarshal(m.Value, &event); err != nil {
			log.Printf("[%s] Unmarshal error: %v", workerID, err)
			continue
		}

		log.Printf("[%s] Processing Event from Client [%s] (Node %s): %s",
			workerID, event.ClientID, event.NodeID, event.Payload)

		// Simulated Worker Business Processing (e.g. Save DB, NLP, Push Notification)
		processedResponse := ws.MessageEvent{
			Type:     "chat_response",
			ClientID: event.ClientID,
			Payload:  fmt.Sprintf("Ack Hello World! %s processed your message: '%s'", workerID, event.Payload),
			NodeID:   event.NodeID,
		}

		respBytes, _ := json.Marshal(processedResponse)

		// Publish back to Redis Hub -> WS Node will push to Client
		err = rdb.Publish(ctx, "ws-outbound", respBytes).Err()
		if err != nil {
			log.Printf("[%s] Redis publish error: %v", workerID, err)
		}
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
