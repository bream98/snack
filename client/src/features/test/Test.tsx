import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '../../design-system';
import {toast} from "../../components/common/Toast.tsx";
import {useParams} from "react-router-dom";
import { SendIcon } from "lucide-react";

type PeerMsgPayload = {
  to: number,
  msg: string,
}

type Message<T> = {
  trace_id : string,
  action : string,
  payload: T
}

type NewMessage = {
  id: number,
  value: string,
  user_id: number,
  CreatedAt: string,
  DeletedAt: string,
}

type ErrorPayload = {
  msg: string,
}

type ServerMessage<T> = {
  trace_id : string,
  action : string,
  payload: T
}

export const Test = () => {
  const [message, setMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<NewMessage[]>([]);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);

  const params = useParams()
  const toId = Number(params.toId)

  useEffect(() => {
    if (wsRef.current) return;

    // Subprotocol Method (Pass token as second argument)
    const token = localStorage.getItem('token') || '';
    const ws = new WebSocket('ws://localhost/ws', ['access_token', token]);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Proxy with Subprotocol!');
      setIsDisconnected(false);
      // ws.send('Welcome Server');
    };

    ws.onmessage = (event) => {
      let data: ServerMessage<any>;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error('Invalid JSON:', event.data);
        return;
      }

      if (data.action === 'ws_error') {
        const errorPayload = data.payload as ErrorPayload;
        toast.error(errorPayload.msg);
      } else if (data.action === 'new_message_response') {
        const newMessage = data.payload as NewMessage;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    ws.onerror = () => {
      setIsDisconnected(true);
    }

    ws.onclose = () => {
      setIsDisconnected(true);
    }

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const send = () => {
    if (!message.trim() || !toId || isNaN(toId)) {
      toast.error("Invalid config")
      return;
    }
    const msg: Message<PeerMsgPayload> = {
      trace_id: '1234567890',
      action: 'send_peer_message',
      payload: {
        to: toId,
        msg: message,
      }
    }
    wsRef.current?.send(JSON.stringify(msg));
    setMessage('');
    setMessage('');
  };

  return (
    <Container>
      <h1>Send Message to WS</h1>
      {isDisconnected && <Alert>Mất kết nôi</Alert>}

      <ListMessages>
        {messages.map((msg, _) => (
          <MessageElement key={msg.id}>
            <small>{msg.user_id}</small>
            <div>{msg.value}</div>
            <i>{new Date(msg.CreatedAt).toLocaleTimeString()}</i>
          </MessageElement>
        ))}
      </ListMessages>

      <SendMessageInput>
        <ChatInput
          autoFocus
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
    </Container>
  );
};

const Container = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding-bottom: 70px;
`;

const ListMessages = styled.div`
`;

const SendMessageInput = styled.div`
  display: flex;
  gap: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background-color: lightsteelblue;
`;

const Alert = styled.div`
    background-color: #f44336;
    color: white;
    padding: 10px;
`

const MessageElement = styled.div`
  margin: 10px 0;
  padding: 10px;
  font-size: 18px;
  &:hover {
    background-color: #f0f0f0;
  }
`

const ChatInput = styled(Input)`
  flex: 1;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  &:focus {
    outline: none;
    border-color: #007bff;
`