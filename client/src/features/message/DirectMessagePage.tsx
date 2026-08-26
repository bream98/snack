import {useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import { toast } from "../../components/common/Toast.tsx";
import { useParams, useSearchParams } from "react-router-dom";
import MessageInput from "../../components/message/MessageInput.tsx";
import { MessageElement } from "../../components/message/MessageElement.tsx";
import {useChatStore} from "../../store/useChatStore.tsx";
import {wsService} from "../../services/wsService.ts";
import {useScroll} from "react-use";

type PeerMsgPayload = {
  to: number,
  msg: string,
}




export const DirectMessagePage = () => {
  const [message, setMessage] = useState('');
  const { messages, fetchHistoricalMessages} = useChatStore()
  const scrollRef = useRef(null);
  // @ts-ignore
  const {x, y} = useScroll(scrollRef);


  // peer user id
  const params = useParams()
  const toId = Number(params.toId)

  // direct channel id if created
  const [searchParams] = useSearchParams();
  const channelIdStr = searchParams.get('channelId');
  const channelId = channelIdStr ? Number(channelIdStr) : null;



  useEffect(() => {
    if (!channelId) return;
    fetchHistoricalMessages(channelId).catch(console.log)
  }, [channelId]);

  const send = () => {
    if (!message.trim() || !toId || isNaN(toId)) {
      toast.error("Invalid config")
      return;
    }

    wsService.send("send_peer_message", {
      to: toId,
      msg: message,
    } as PeerMsgPayload)

    setMessage('');
  };

  const channelMessageData = useMemo(() => {
      return !channelId  || !messages[channelId] ? {
        messageIds: [],
        messageMap: {}
      } : messages[channelId]
  }, [messages, channelId])



  return (
    <Container>
      <Header>Send Message to WS
        <div ref={scrollRef}>
          <div>x: {x}</div>
          <div>y: {y}</div>
        </div>

      </Header>

      <ListMessages>
        {channelMessageData.messageIds.map((id, _) => {
          return <MessageElement msg={channelMessageData.messageMap[id]} key={id} />
        })}
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
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const Header = styled.h1`
  flex-shrink: 0;
  margin: 0;
  padding: 1rem 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  background-color: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  z-index: 10;
`;

const ListMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column-reverse;
`;
