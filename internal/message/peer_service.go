package message

import (
	"encoding/json"
	"errors"
	"fmt"
	"snack/internal/domain"
	"snack/internal/repo"

	"gorm.io/gorm"
)

type PeerService struct {
	Db                *gorm.DB
	UserRepo          *repo.UserRepo
	DirectChannelRepo *repo.DirectChannelRepo
	RedisService      *RedisService
}

func (p *PeerService) HandleNewMsg(user *Client, b []byte) error {
	// -> Validate
	payload, err := ParsePeerPayload(b)
	if err != nil {
		return err
	}

	if user.UserId == payload.To {
		return errors.New("invalid receiver")
	}

	// -> Save message
	dc, err := p.DirectChannelRepo.Save(&domain.DirectChannel{
		UserId1: user.UserId,
		UserId2: payload.To,
	})
	if err != nil {
		return err
	}

	msg, err := p.DirectChannelRepo.CreateMessage(&domain.Message{
		ChannelId: dc.ID,
		UserId:    user.UserId,
		Value:     payload.Msg,
	})
	if err != nil {
		return err
	}

	// Send message to sender
	fmt.Printf("Sending message: %s\n", msg)
	serverMessage := ServerMessage{
		TraceID: "1",
		Action:  NewMessageResponse,
		Payload: msg,
	}
	serverMessageBytes, err := json.Marshal(serverMessage)
	if err != nil {
		return err
	}
	user.Send <- serverMessageBytes

	// Send message to redis

	redisMessage := &PublishRedisMessage{
		Action: ActionHandleDirectMsg,
		Payload: PublishRedisPayload{
			To:  payload.To,
			Msg: &serverMessage,
		},
	}
	err = p.RedisService.Publish(redisMessage)
	if err != nil {
		fmt.Println("Err publish redis", err)
		return err
	}

	// If invalid return error
	return nil
}
