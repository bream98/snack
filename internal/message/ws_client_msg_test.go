package message

import "testing"

func TestParseClientMessage(t *testing.T) {
	emptyMessage := "{}"
	_, err := ParseClientMessage([]byte(emptyMessage))
	if err == nil {
		t.Error("expected error")
	}

	noTradeId := `{"action":"send_peer_message","to_id":1,"msg":"hello"}`
	_, err = ParseClientMessage([]byte(noTradeId))
	if err.Error() != "invalid message" {
		t.Errorf("expected error: %s", err.Error())
	}

	wrongAction := `{"action":"wrong_action","to_id":1,"msg":"hello","trace_id":"1234567890"}`
	_, err = ParseClientMessage([]byte(wrongAction))
	if err.Error() != "invalid message" {
		t.Errorf("expected error: %s", err.Error())
	}
}

func TestParsePeerPayload(t *testing.T) {
	noToId := `{"msg":"hello","trace_id":"1234567890"}`
	_, err := ParsePeerPayload([]byte(noToId))
	if err == nil || err.Error() != "invalid payload" {
		t.Errorf("noToId=>expected error")
	}

	noMsg := `{"to_id":1}`
	_, err = ParsePeerPayload([]byte(noMsg))
	if err == nil || err.Error() != "invalid payload" {
		t.Errorf("noMsg=>expected error")
	}

	zeroToId := `{"to_id":0,"msg":"hello"}`
	_, err = ParsePeerPayload([]byte(zeroToId))
	if err == nil || err.Error() != "invalid payload" {
		t.Errorf("0toId=>expected error")
	}
}
