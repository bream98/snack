package message

import (
	"encoding/json"
	"errors"
)

type NewPeerMsgPayload struct {
	To  uint            `json:"to"`
	Msg json.RawMessage `json:"msg"`
}

type RedisAction string

const (
	ActionHandleDirectMsg RedisAction = "action_handle_direct_msg"
)

type RedisMessage struct {
	Action  RedisAction     `json:"action"`
	Payload json.RawMessage `json:"payload"`
}

type PublishRedisMessage struct {
	Action  RedisAction `json:"action"`
	Payload interface{} `json:"payload"`
}

type PublishRedisPayload struct {
	To  uint           `json:"to"`
	Msg *ServerMessage `json:"msg"`
}

func ParseMessage(msg []byte) (*RedisMessage, error) {
	var subscribeMsg RedisMessage
	err := json.Unmarshal(msg, &subscribeMsg)
	if err != nil {
		return nil, errors.New("invalid redis message")
	}
	if subscribeMsg.Action != ActionHandleDirectMsg {
		return nil, errors.New("invalid redis action")
	}
	return &subscribeMsg, nil
}

func ParsePayload(msg []byte) (*NewPeerMsgPayload, error) {
	var newRedisMsgPayload NewPeerMsgPayload
	err := json.Unmarshal(msg, &newRedisMsgPayload)
	if err != nil || newRedisMsgPayload.To == 0 {
		return nil, errors.New("invalid peer message payload")
	}
	return &newRedisMsgPayload, nil
}
