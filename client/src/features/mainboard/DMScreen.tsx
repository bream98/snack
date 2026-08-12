import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useChatStore } from '../../store/useChatStore';
import { MessageItem } from '../chat/MessageItem';
import { ChatInput } from '../../components/common/ChatInput';
import { Heading } from '../../design-system';

const FlexibleLayout = styled.div`
  display: flex;
  height: 100%;
  gap: 0;
  overflow: hidden;
  border-radius: 0;
  border: none;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 0;
  border: none;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border: none;
`;

/* Gentle, elegant subtle pattern background for DM feed */
const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0;
  border: none;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};

  background-image: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(${theme.colors.primary}12 1px, transparent 1px)`
      : `radial-gradient(${theme.colors.primary}18 1px, transparent 1px), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231a73e8' fill-opacity='0.035' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`};
  background-size:
    24px 24px,
    60px 60px;
  background-position:
    0 0,
    0 0;
`;

const InputContainerWrapper = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border: none;
`;

export function DMScreen() {
  const { userId = 'usr-2' } = useParams<{ userId: string }>();
  const {
    messages,
    activeSubContent,
    openBranch,
    sendMessage,
    editMessage,
    recallMessage,
    toggleReaction,
  } = useChatStore();

  const [text, setText] = useState('');

  const dmMessages = messages[userId] || [];
  const activeBranchMessageId =
    activeSubContent?.type === 'branch' ? activeSubContent.data?.messageId : null;

  const handleSendMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(userId, text);
    setText('');
  };

  return (
    <FlexibleLayout>
      {/* 📌 MAIN DM CHAT AREA */}
      <MainArea>
        <HeaderBar>
          <Heading size="lg" weight="bold">
            💬 Direct Message ({userId})
          </Heading>
        </HeaderBar>

        {/* Gentle Pattern Background DM Message Feed */}
        <MessageList>
          {dmMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isBranchActive={msg.id === activeBranchMessageId}
              onOpenBranch={(messageId) => openBranch(messageId)}
              onAddReaction={(emoji) => toggleReaction(userId, msg.id, emoji)}
              onEditMessage={(messageId, newText) => editMessage(userId, messageId, newText)}
              onRecallMessage={(messageId) => recallMessage(userId, messageId)}
            />
          ))}
        </MessageList>

        <InputContainerWrapper>
          <ChatInput
            placeholder={`Send DM to ${userId}... (@ to mention)`}
            value={text}
            onChange={setText}
            onSubmit={handleSendMain}
            buttonText="Send DM"
          />
        </InputContainerWrapper>
      </MainArea>
    </FlexibleLayout>
  );
}
