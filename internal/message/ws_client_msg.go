package message

import (
	"encoding/json"
	"errors"
)

type Action string

const (
	SendPeerMessage    Action = "send_peer_message"
	SendChannelMessage Action = "send_channel_message"
)

type MessageEvent struct {
	Type     string `json:"type"`
	ClientID string `json:"client_id"`
	Payload  string `json:"payload"`
	NodeID   string `json:"node_id"`
}

type ClientMessage struct {
	TraceID string          `json:"trace_id"`
	Action  Action          `json:"action"`
	Payload json.RawMessage `json:"payload"`
}

func ParseClientMessage(msg []byte) (*ClientMessage, error) {
	var clientMsg ClientMessage
	err := json.Unmarshal(msg, &clientMsg)
	if err != nil {
		return nil, err
	}

	err = validate(&clientMsg)
	if err == nil {
		return &clientMsg, nil
	}

	return &clientMsg, errors.New("invalid message")
}

type PeerMessage struct {
	To  uint   `json:"to"`
	Msg string `json:"msg"`
}

func ParsePeerPayload(msg []byte) (*PeerMessage, error) {
	var peerMsg PeerMessage
	err := json.Unmarshal(msg, &peerMsg)
	errObj := errors.New("invalid payload")
	if err != nil || peerMsg.To == 0 || peerMsg.Msg == "" {
		return nil, errObj
	}

	return &peerMsg, nil
}

func validate(msg *ClientMessage) error {
	switch msg.Action {
	case SendPeerMessage, SendChannelMessage:
		break
	default:
		return errors.New("invalid message")
	}

	if msg.TraceID == "" {
		return errors.New("invalid message")
	}
	return nil
}

type ChannelMessage struct {
	ChannelId uint   `json:"channel_id"`
	Msg       string `json:"msg"`
}

func ParseChannelPayload(msg []byte) (*ChannelMessage, error) {
	var channelMsg ChannelMessage
	err := json.Unmarshal(msg, &channelMsg)
	errObj := errors.New("invalid payload")
	if err != nil || channelMsg.ChannelId == 0 || channelMsg.Msg == "" {
		return nil, errObj
	}
	return &channelMsg, nil
}
