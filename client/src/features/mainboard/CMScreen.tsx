import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useChatStore } from '../../store/useChatStore';
import { MessageItem } from '../chat/MessageItem';
import { ChatInput } from '../../components/common/ChatInput';
import { Heading } from '../../design-system';
import { ChannelMenu } from '../../components/layout/ChannelMenu';
import { ChannelMembersModal } from '../../components/layout/ChannelMembersModal';

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

const ChannelTitleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}12;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  /* Clear, distinct Telegram pattern background with pastel gradient mesh */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? '#0f172a'
      : 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)'};

  background-image: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(${theme.colors.primary}15 1.5px, transparent 1.5px)`
      : `radial-gradient(${theme.colors.primary}22 1.5px, transparent 1.5px), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.09' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 50%, #f0fdf4 100%)`};
  background-size:
    24px 24px,
    60px 60px,
    100% 100%;
  background-position:
    0 0,
    0 0,
    0 0;
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
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 110, left: 248 });
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [channelMemberList, setChannelMemberList] = useState([currentUser, ...members]);

  const channelMessages = messages[channelId] || [];

  const handleSendMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(channelId, text);
    setText('');
  };

  const handleChannelTitleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
    setShowMenu((prev) => !prev);
  };

  const handleRemoveMember = (memberId: string) => {
    setChannelMemberList((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleLeaveChannel = () => {
    alert(`You have left channel #${channelId}`);
    navigate('/app/cm/general');
  };

  const activeBranchMessageId =
    activeSubContent?.type === 'branch' ? activeSubContent.data?.messageId : null;

  return (
    <FlexibleLayout>
      {/* 📌 MAIN CHAT AREA */}
      <MainArea>
        <HeaderBar>
          {/* Clickable Channel Title opening ChannelMenu */}
          <ChannelTitleBtn onClick={handleChannelTitleClick}>
            <Heading size="lg" weight="bold">
              #{channelId}
            </Heading>
            <span style={{ fontSize: '11px', color: '#64748b' }}>▼</span>
          </ChannelTitleBtn>
        </HeaderBar>

        {/* 📋 CHANNEL DROPDOWN MENU WITH METADATA */}
        {showMenu && (
          <ChannelMenu
            channelName={channelId}
            createdTime="Oct 15, 2025"
            createdBy="Nam Luong"
            memberCount={channelMemberList.length}
            position={menuPos}
            onClose={() => setShowMenu(false)}
            onOpenMembersModal={() => setShowMembersModal(true)}
            onLeaveChannel={handleLeaveChannel}
          />
        )}

        {/* 👥 CHANNEL MEMBERS MODAL */}
        {showMembersModal && (
          <ChannelMembersModal
            channelName={channelId}
            members={channelMemberList}
            onClose={() => setShowMembersModal(false)}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {/* Distinct Telegram Pattern Background Message Feed */}
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
