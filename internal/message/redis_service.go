package message

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type RedisService struct {
	RedisDb *redis.Client
	Ctx     context.Context
	Manager *Manager
}

const WsOutboundChannel = "ws_outbound_channel"

func (r *RedisService) Publish(msg *PublishRedisMessage) error {
	return r.RedisDb.Publish(r.Ctx, WsOutboundChannel, msg).Err()
}

func (r *RedisService) ListenOutboundChannel() {
	pubsub := r.RedisDb.Subscribe(r.Ctx, WsOutboundChannel)
	defer func(pubsub *redis.PubSub) {
		_ = pubsub.Close()
	}(pubsub)

	for msg := range pubsub.Channel() {
		// parse subscribe message
		fmt.Println(msg.Payload)
		msg, err := ParseMessage([]byte(msg.Payload))
		if err != nil {
			// write to log
			fmt.Println(err)
			continue
		}
		switch msg.Action {
		case ActionHandleDirectMsg:
			r.HandleNewPeerMsg(msg.Payload)
		default:
			fmt.Println("unknown redis subscribe action")
			continue
		}
	}
}

func (r *RedisService) HandleNewPeerMsg(p json.RawMessage) {
	// send it to receiver
	// write to log if error
	payload, err := ParsePayload(p)
	if err != nil {
		fmt.Println(err)
		return
	}

	for _, client := range r.Manager.GetClientByUserid(payload.To) {
		client.Send <- payload.Msg
	}
}
