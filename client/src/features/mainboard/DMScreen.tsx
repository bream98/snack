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
  gap: 0.375rem;
  overflow: hidden;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.25rem;
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
      {/* 📌 MAIN CHAT AREA */}
      <MainArea>
        <Heading size="lg" weight="bold">
          Direct Message ({userId})
        </Heading>

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

        <ChatInput
          placeholder={`Send DM to ${userId}... (@ to mention)`}
          value={text}
          onChange={setText}
          onSubmit={handleSendMain}
          buttonText="Send DM"
        />
      </MainArea>
    </FlexibleLayout>
  );
}
