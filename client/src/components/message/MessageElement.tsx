import { useMemo } from "react";
import styled from "styled-components";
import ReactNiceAvatar, { genConfig } from "react-nice-avatar";
import type { DirectMessageDB } from "../../store/useDirectChatStore.ts";

type Props = {
  msg: DirectMessageDB;
};

export const MessageElement = ({ msg }: Props) => {
  // Cache avatar config theo Tên user + User ID dùng useMemo
  const avatarConfig = useMemo(() => {
    const avatarSeed = `${msg.user?.display_name || 'User'}_${msg.user_id}`;
    return genConfig(avatarSeed);
  }, [msg.user?.display_name, msg.user_id]);

  return (
    <MessageElementInner key={msg.ID}>
      <AvatarSquare>
        <ReactNiceAvatar shape="square" style={{ width: '100%', height: '100%' }} {...avatarConfig} />
      </AvatarSquare>
      <div>
        <Sender>{msg.user?.display_name}</Sender>
        <MessageText>{msg.value}</MessageText>
        <small>{new Date(msg.CreatedAt).toLocaleTimeString()}</small>
      </div>
    </MessageElementInner>
  );
};

const AvatarSquare = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
`;

const MessageElementInner = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 10px 0;
  padding: 10px;
  font-size: 1.2rem;

  &:hover {
    background-color: #f0f0f0;
  }

  small {
    font-size: 0.8rem;
  }
`;

const Sender = styled.div`
  font-weight: 500;
  font-size: 1rem;
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;
