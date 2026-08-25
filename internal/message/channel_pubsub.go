package message

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/redis/go-redis/v9"
)

const Prefix = "channel:"

type ChannelPubsub struct {
	Rdb *redis.Client
	Ctx context.Context
}

// Publish publishes a message to redis
func (r *ChannelPubsub) Publish(channelId uint, msg *ClientMessage) error {
	bytes, err := json.Marshal(msg)
	if err != nil {
		return errors.New("failed to marshal channel message")
	}
	return r.Rdb.Publish(r.Ctx, Prefix+fmt.Sprint(channelId), bytes).Err()
}

func (r *ChannelPubsub) ListenForMessages() {
	pubsub := r.Rdb.Subscribe(r.Ctx, Prefix+"*")
	defer func(pubsub *redis.PubSub) {
		err := pubsub.Close()
		if err != nil {
			// log
			fmt.Println(err)
			return
		}
	}(pubsub)

	ch := pubsub.Channel()
	for msg := range ch {
		err := r.handlePayload(msg.Payload)
		// log
		fmt.Println(err)
	}
}

// handlePayload handles a new message from redis
// broadcasts to all clients subscribed to the channel
func (r *ChannelPubsub) handlePayload(payload string) error {
	fmt.Println(payload)
	return nil
}
