import {Button} from "../../design-system";
import {SendIcon} from "lucide-react";
import styled from "styled-components";

type Props = {
    message: string,
    setMessage: (message: string) => void,
    send: () => void,
}

export default function MessageInput({message, setMessage, send}: Props) {
    return (
        <SendMessageInput>
            <ChatInput
                type="text"
                placeholder="Gửi"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <Button onClick={send}>
                <SendIcon />
            </Button>
        </SendMessageInput>
    )
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



const ChatInput = styled.input`
  flex: 1;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  &:focus {
    outline: none;
    border-color: #007bff;
`