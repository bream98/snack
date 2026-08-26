import { useState, useRef } from "react";
import { useClickAway } from "react-use";
import EmojiPicker from "emoji-picker-react";
import { Button } from "../../design-system";
import { SendIcon, Smile } from "lucide-react";
import styled from "styled-components";
import React from "react";

type Props = {
  message: string;
  setMessage: (message: string) => void;
  send: () => void;
};

export default function MessageInput({ message, setMessage, send }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useClickAway(pickerRef, () => {
    setShowPicker(false);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <SendMessageInput ref={pickerRef}>
      {showPicker && (
        <PickerWrapper>
          <EmojiPicker onEmojiClick={(e) => setMessage(message + e.emoji)} />
        </PickerWrapper>
      )}

      <IconButton onClick={() => setShowPicker(!showPicker)} type="button">
        <Smile size={22} />
      </IconButton>

      <ChatInput
        placeholder="Gửi tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button onClick={send} style={{ padding: "12px" }}>
        <SendIcon />
      </Button>
    </SendMessageInput>
  );
}

const SendMessageInput = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  padding: 16px 24px;
  background-color: white;
  align-items: center;
`;

const PickerWrapper = styled.div`
  position: absolute;
  bottom: 75px;
  left: 24px;
  z-index: 50;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f1f3f4;
    color: #1a73e8;
  }
`;

const ChatInput = styled.textarea`
  flex: 1;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: inherit;
  border: 1px solid #ccc;
  resize: none;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;