

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {toast} from "../../components/common/Toast.tsx";
import {useParams, useSearchParams} from "react-router-dom";
import {type DirectMessageDB, useDirectChatStore} from "../../store/useDirectChatStore.ts";
import MessageInput from "../../components/message/MessageInput.tsx";

type PeerMsgPayload = {
  to: number,
  msg: string,
}

type Message<T> = {
  trace_id : string,
  action : string,
  payload: T
}

type ErrorPayload = {
  msg: string,
}

type ServerMessage<T> = {
  trace_id : string,
  action : string,
  payload: T
}

export const DirectMessagePage = () => {
  const [message, setMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<DirectMessageDB[]>([]);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);

  // peer user id
  const params = useParams()
  const toId = Number(params.toId)

  // direct channel id if created
  const [searchParams] = useSearchParams();
  const channelIdStr = searchParams.get('channelId');
  const channelId = channelIdStr ? Number(channelIdStr) : null;

  const { fetchDirectMessages, directMessagesByChannel } = useDirectChatStore()

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
        const newMessage = data.payload as DirectMessageDB;
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

  useEffect(() => {
    if (!channelId) return;
    fetchDirectMessages(channelId).catch(console.error);
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return
    setMessages(directMessagesByChannel[channelId] || [])
  }, [directMessagesByChannel]);

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
              <MessageElement key={msg.ID}>
                <Sender>{msg.user?.display_name}</Sender>
                <div>{msg.value}</div>
                <small>{new Date(msg.CreatedAt).toLocaleTimeString()}</small>
              </MessageElement>
          ))}
        </ListMessages>

          <MessageInput
              message={message}
              setMessage={(msg) => setMessage(msg)}
              send={send}
          />

      </Container>
  );
};

const Container = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
`;

const ListMessages = styled.div`
`;



const Alert = styled.div`
    background-color: #f44336;
    color: white;
    padding: 10px;
`

const MessageElement = styled.div`
  margin: 10px 0;
  padding: 10px;
  &:hover {
    background-color: #f0f0f0;
  }

  font-size: 1.2rem;
  
  
  
  small {
    font-size: 0.8rem;
  }
`

const Sender = styled.div`
  font-weight: 500;
  font-size: 1rem;
`

