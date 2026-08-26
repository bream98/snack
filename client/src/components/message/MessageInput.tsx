import { Button } from "../../design-system";
import { SendIcon } from "lucide-react";
import styled from "styled-components";
import React from "react";

type Props = {
  message: string;
  setMessage: (message: string) => void;
  send: () => void;
};

export default function MessageInput({ message, setMessage, send }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Nếu bấm Enter mà KHÔNG giữ Shift -> Gửi tin nhắn và chặn xuống dòng mặc định
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <SendMessageInput>
      <ChatInput
        placeholder="Gửi tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={send}>
        <SendIcon />
      </Button>
    </SendMessageInput>
  );
}

const SendMessageInput = styled.div`
  display: flex;
  gap: 10px;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background-color: white;
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