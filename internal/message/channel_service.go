package message

import (
	"errors"
	"snack/internal/domain"
	"snack/internal/repo"
)

type ChannelService struct {
	ChannelPubsub *ChannelPubsub
	ChannelRepo   *repo.ChannelRepo
	UserRepo      *repo.UserRepo
}

// HandleNewMsg handles a new message from ws client
func (c *ChannelService) HandleNewMsg(client *Client, clientMessage *ClientMessage) error {
	parsedPayload, err := ParseChannelPayload(clientMessage.Payload)
	if err != nil {
		return err
	}

	// validate
	sender, err := c.UserRepo.GetUserById(client.UserId)
	if err != nil {
		return err
	}

	channel, err := c.ChannelRepo.GetById(parsedPayload.ChannelId)
	if err != nil || channel == nil {
		return errors.New("channel not found")
	}

	isValidSender := c.ChannelRepo.CheckMember(parsedPayload.ChannelId, client.UserId)
	if !isValidSender {
		return errors.New("sender is not a member of this channel")
	}

	// save message
	msg := &domain.ChannelMessage{
		UserId:    client.UserId,
		ChannelId: parsedPayload.ChannelId,
		Value:     parsedPayload.Msg,
	}
	msg.User = *sender
	err = c.ChannelRepo.CreateMessage(msg)
	if err != nil {
		return err
	}

	serverMessage := ServerMessage{
		Action:  NewChannelMessageResponse,
		Payload: msg,
	}

	err = c.ChannelPubsub.Publish(parsedPayload.ChannelId, serverMessage)
	if err != nil {
		return err
	}
	return nil
}
