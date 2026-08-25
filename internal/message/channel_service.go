package message

import "fmt"

type ChannelService struct {
	channelPubsub *ChannelPubsub
}

// HandleNewMsg handles a new message from ws client
func (c *ChannelService) HandleNewMsg(client *Client, clientMessage *ClientMessage) error {
	fmt.Println("received ws msg", clientMessage.Action)

	parsedPayload, err := ParseChannelMessage(clientMessage.Payload)
	if err != nil {
		return err
	}

	err = c.channelPubsub.Publish(parsedPayload.ChannelId, clientMessage)
	if err != nil {
		return err
	}
	return nil
}
