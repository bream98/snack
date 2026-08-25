package message

import (
	"encoding/json"
	"errors"
	"snack/internal/domain"
)

// ParseChannelMessage parses a channel message from ws client
func ParseChannelMessage(payload json.RawMessage) (*domain.ChannelMessage, error) {
	channelMessage := &domain.ChannelMessage{}
	err := json.Unmarshal(payload, channelMessage)
	if err == nil {
		return nil, errors.New("invalid channel message")
	}
	return channelMessage, nil

}
