import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '../../design-system';
import {toast} from "../../components/common/Toast.tsx";

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
  created_at: string,
  updated_at: string,
  deleted_at: string,
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
  const [messages, setMessages] = useState<string[]>([]);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);


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
        setMessages((prevMessages) => [...prevMessages, newMessage.value]);
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
    const msg: Message<PeerMsgPayload> = {
      trace_id: '1234567890',
      action: 'send_peer_message',
      payload: {
        to: 1,
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
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </ListMessages>

      <SendMessageInput>
        <Input
          autoFocus
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <Button onClick={send}>Send</Button>
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
  p {
    margin: 10px 0;
    padding: 10px;
    font-size: 18px;
    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

const SendMessageInput = styled.div`
  display: flex;
  gap: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
`;

const Alert = styled.div`
    background-color: #f44336;
    color: white;
    padding: 10px;
`