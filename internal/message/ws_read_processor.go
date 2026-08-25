package message

import (
	"encoding/json"
	"errors"
	"fmt"
)

type WsReadProcessor struct {
	PeerService    *PeerService
	ChannelService *ChannelService
}

func (c *WsReadProcessor) Handle(user *Client, msg []byte) {
	clientMsg, err := ParseClientMessage(msg)
	if err != nil {
		fmt.Println(err)
		sendError(user, clientMsg, err)
		return
	}

	switch clientMsg.Action {
	case SendPeerMessage:
		err = c.PeerService.HandleNewMsg(user, clientMsg)
		if err != nil {
			fmt.Println(err)
			sendError(user, clientMsg, err)
			return
		}
	case SendChannelMessage:
		err = c.ChannelService.HandleNewMsg(user, clientMsg)
		if err != nil {
			fmt.Println(err)
			sendError(user, clientMsg, err)
			return
		}
	default:
		sendError(user, clientMsg, errors.New("invalid action"))
	}

}

func sendError(user *Client, clientMsg *ClientMessage, err error) {
	errMessage := ServerMessage{
		TraceID: clientMsg.TraceID,
		Action:  WsError,
		Payload: ServerErrorPayload{
			Msg: err.Error(),
		},
	}

	b, err := json.Marshal(errMessage)
	if err != nil {
		fmt.Println(err)
		return
	}

	user.Send <- b
}
