import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from "../../components/common/Toast.tsx";
import { useParams, useSearchParams } from "react-router-dom";
import MessageInput from "../../components/message/MessageInput.tsx";
import { MessageElement } from "../../components/message/MessageElement.tsx";
import { useChatStore } from "../../store/useChatStore.tsx";
import { wsService } from "../../services/wsService.ts";
import { useScroll } from "react-use";
import {PhoneCallIcon} from "lucide-react";

type PeerMsgPayload = {
  to: number;
  msg: string;
};

export const DirectMessagePage = () => {
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const isInitialChannelLoad = useRef(true);
  const { messages, fetchHistoricalMessages } = useChatStore();
  const scrollRef = useRef(null);
  // @ts-ignore
  const { x, y } = useScroll(scrollRef);

  // peer user id
  const params = useParams();
  const toId = Number(params.toId);

  // direct channel id if created
  const [searchParams] = useSearchParams();
  const channelIdStr = searchParams.get('channelId');
  const channelId = channelIdStr ? Number(channelIdStr) : null;

  // Reset alert tin nhắn mới và cờ nạp kênh ban đầu khi chuyển channel hoặc đổi toId
  useEffect(() => {
    setShowAlert(false);
    isInitialChannelLoad.current = true;
    if (!channelId) return;
    fetchHistoricalMessages(channelId).catch(console.log);
  }, [channelId, toId]);

  const send = () => {
    if (!toId || isNaN(toId)) {
      toast.error("Invalid config");
      return;
    }

    if (!message.trim()) return;

    wsService.send("send_peer_message", {
      to: toId,
      msg: message,
    } as PeerMsgPayload);

    setMessage('');
  };

  const channelMessageData = useMemo(() => {
    return !channelId || !messages[channelId]
      ? {
          messageIds: [],
          messageMap: {},
        }
      : messages[channelId];
  }, [messages, channelId]);

  useEffect(() => {
    if (channelMessageData.messageIds.length === 0) return;

    if (isInitialChannelLoad.current) {
      isInitialChannelLoad.current = false;
      return;
    }

    if (Math.abs(y) > 30) {
      setShowAlert(true);
    }
  }, [channelMessageData.messageIds.length]);

  useEffect(() => {
    if (Math.abs(y) <= 30) {
      setShowAlert(false);
    }
  }, [y]);

  const handleShowLatestMessage = () => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowAlert(false);
  };

  return (
    <Container>
      <Header>
        <div>
          Send Message to WS
        </div>
        <PhoneCallIcon />
      </Header>

      <ListMessages ref={scrollRef}>
        {channelMessageData.messageIds.map((id, _) => {
          return <MessageElement msg={channelMessageData.messageMap[id]} key={id} />;
        })}
      </ListMessages>

      {/* Alert hiển thị tin nhắn mới, click để cuộn về tin mới nhất */}
      {showAlert && (
        <NewMessageAlert onClick={handleShowLatestMessage}>
          Có tin nhắn mới!
        </NewMessageAlert>
      )}

      <MessageInput
        message={message}
        setMessage={(msg) => setMessage(msg)}
        send={send}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`;

const Header = styled.div`
  flex-shrink: 0;
  margin: 0;
  padding: 1rem 1.25rem;
  z-index: 10;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  font-size: 1.2rem;
  font-weight: 500;
`;

const ListMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column-reverse;
`;

const NewMessageAlert = styled.button`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    background-color: #1557b0;
  }
`;
