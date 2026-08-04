import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Card, Text, Heading, Button } from '../../design-system';
import type { Message } from '../../store/useChatStore';
import { useChatStore } from '../../store/useChatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from '../../components/common/ChatInput';

const BranchTile = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.75rem;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`;

const ResizeHandle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.15s ease;

  &:hover, &:active {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const RepliesFeed = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export interface BranchPanelProps {
  parentMessage: Message;
  onClose: () => void;
  onSendReply: (text: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onRecallMessage?: (messageId: string) => void;
}

export function BranchPanel({
  parentMessage,
  onClose,
  onSendReply,
  onAddReaction,
  onEditMessage,
  onRecallMessage,
}: BranchPanelProps) {
  const [replyText, setReplyText] = useState('');
  const { setBranchWidth } = useChatStore();
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = window.innerWidth - event.clientX - 12;
      setBranchWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(replyText);
    setReplyText('');
  };

  return (
    <BranchTile glass>
      {/* Drag Resize Handle */}
      <ResizeHandle onMouseDown={handleMouseDown} title="Drag to resize Branch" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="sm" weight="bold">🌿 Branch</Heading>
        <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '2px 6px' }}>✕</Button>
      </div>

      {/* Parent Message */}
      <div>
        <Text size="xs" weight="bold" colorVariant="secondary" style={{ marginBottom: '0.25rem' }}>
          MAIN MESSAGE
        </Text>
        <MessageItem
          message={parentMessage}
          onAddReaction={(emoji) => onAddReaction && onAddReaction(parentMessage.id, emoji)}
          onEditMessage={onEditMessage}
          onRecallMessage={onRecallMessage}
        />
      </div>

      {/* Replies Feed */}
      <RepliesFeed>
        <Text size="xs" weight="bold" colorVariant="secondary">
          BRANCH REPLIES ({parentMessage.branchReplies.length})
        </Text>
        {parentMessage.branchReplies.map((reply) => (
          <MessageItem
            key={reply.id}
            message={reply}
            onAddReaction={(emoji) => onAddReaction && onAddReaction(reply.id, emoji)}
            onEditMessage={onEditMessage}
            onRecallMessage={onRecallMessage}
          />
        ))}
      </RepliesFeed>

      {/* Reply Input Form */}
      <ChatInput
        placeholder="Reply in branch... (@ to mention)"
        value={replyText}
        onChange={setReplyText}
        onSubmit={handleSubmit}
        buttonText="Send"
      />
    </BranchTile>
  );
}
