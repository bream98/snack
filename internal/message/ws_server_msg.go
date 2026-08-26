package message

type ServerAction string

const (
	NewMessageResponse        ServerAction = "new_message_response"
	WsError                   ServerAction = "ws_error"
	NewChannelMessageResponse ServerAction = "new_channel_message_response"
)

type ServerMessage struct {
	TraceID string       `json:"trace_id"`
	Action  ServerAction `json:"action"`
	Payload interface{}  `json:"payload"`
}

type ServerErrorPayload struct {
	Msg string `json:"msg"`
}
