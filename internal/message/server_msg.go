package message

type ServerAction string

const (
	NewMessageResponse ServerAction = "new_message_response"
	WsError            ServerAction = "ws_error"
)

type ServerMessage struct {
	TraceID string       `json:"trace_id"`
	Action  ServerAction `json:"action"`
	Payload interface{}  `json:"payload"`
}

type ServerErrorPayload struct {
	Msg string `json:"msg"`
}
