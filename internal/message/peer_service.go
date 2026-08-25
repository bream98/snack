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

func (p *PeerService) HandleNewMsg(user *Client, clientMessage *ClientMessage) error {
	// -> Validate
	payload, err := ParsePeerPayload(clientMessage.Payload)
	if err != nil {
		return err
	}

	if user.UserId == payload.To {
		return errors.New("invalid receiver")
	}

	// -> get sender infomation
	dbUser, err := p.UserRepo.GetUserById(user.UserId)
	if err != nil {
		return err
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
	msg.User = *dbUser

	// Send message to sender
	serverMessage := ServerMessage{
		TraceID: clientMessage.TraceID,
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
