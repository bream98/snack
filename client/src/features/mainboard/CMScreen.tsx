import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useChatStore } from '../../store/useChatStore';
import { MessageItem } from '../chat/MessageItem';
import { ChatInput } from '../../components/common/ChatInput';
import { Heading, Button } from '../../design-system';
import { ChannelMembersPopover } from '../../components/layout/ChannelMembersPopover';

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

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.25rem;
`;

export function CMScreen() {
  const navigate = useNavigate();
  const { channelId = 'general' } = useParams<{ channelId: string }>();
  const {
    messages,
    members,
    currentUser,
    activeSubContent,
    openBranch,
    sendMessage,
    editMessage,
    recallMessage,
    toggleReaction,
  } = useChatStore();

  const [text, setText] = useState('');
  const [showMemberPopover, setShowMemberPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 110, left: 300 });

  const channelMessages = messages[channelId] || [];
  const allChannelMembers = [currentUser, ...members];

  const handleSendMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(channelId, text);
    setText('');
  };

  const handleOpenMembers = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 6, left: Math.max(10, rect.right - 320) });
    setShowMemberPopover((prev) => !prev);
  };

  const activeBranchMessageId =
    activeSubContent?.type === 'branch' ? activeSubContent.data?.messageId : null;

  return (
    <FlexibleLayout>
      {/* 📌 MAIN CHAT AREA */}
      <MainArea>
        <HeaderBar>
          <Heading size="lg" weight="bold">
            #{channelId}
          </Heading>

          {/* 👥 CM CHANNEL MEMBERS TRIGGER */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenMembers}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            👥 Members ({allChannelMembers.length})
          </Button>
        </HeaderBar>

        {/* 👥 CHANNEL MEMBERS POPOVER */}
        {showMemberPopover && (
          <ChannelMembersPopover
            members={allChannelMembers}
            position={popoverPos}
            onClose={() => setShowMemberPopover(false)}
            onSendDM={(userId) => navigate(`/app/dm/${userId}`)}
          />
        )}

        <MessageList>
          {channelMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isBranchActive={msg.id === activeBranchMessageId}
              onOpenBranch={(messageId) => openBranch(messageId)}
              onAddReaction={(emoji) => toggleReaction(channelId, msg.id, emoji)}
              onEditMessage={(messageId, newText) => editMessage(channelId, messageId, newText)}
              onRecallMessage={(messageId) => recallMessage(channelId, messageId)}
            />
          ))}
        </MessageList>

        <ChatInput
          placeholder={`Send message to #${channelId}... (@ to mention)`}
          value={text}
          onChange={setText}
          onSubmit={handleSendMain}
          buttonText="Send"
        />
      </MainArea>
    </FlexibleLayout>
  );
}
