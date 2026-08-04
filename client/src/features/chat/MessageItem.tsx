import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Text, Button, Input } from '../../design-system';
import type { Message } from '../../store/useChatStore';
import { useChatStore } from '../../store/useChatStore';
import { MemberMiniProfilePopover } from '../../components/common/MemberMiniProfilePopover';
import { renderFormattedText } from '../../utils/tagParser';

interface MessageRowProps {
  $isBranchActive?: boolean;
  $isRecalled?: boolean;
  $isUnread?: boolean;
}

const MessageRow = styled.div<MessageRowProps>`
  position: relative;
  display: flex;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.md};
  /* Solid high-contrast surface backdrop ensuring 100% crisp readability over any background */
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-sizing: border-box;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}08`};
  }

  /* Floating toolbar trigger */
  &:hover .message-toolbar {
    opacity: 1;
    pointer-events: auto;
  }

  ${({ $isBranchActive, theme }) =>
    $isBranchActive &&
    css`
      background-color: ${theme.colors.primary}18 !important;
      border-color: ${theme.colors.primary} !important;
    `}

  ${({ $isUnread, theme }) =>
    $isUnread &&
    css`
      border-left: 3.5px solid ${theme.colors.primary};
      background-color: ${theme.colors.primary}0d;
    `}

  ${({ $isRecalled }) =>
    $isRecalled &&
    css`
      opacity: 0.65;
    `}
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
  cursor: pointer;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const SenderName = styled(Text)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ContentArea = styled.div`
  font-size: 0.9375rem;
  line-height: 1.48;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`;

const RecalledText = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const FloatingToolbar = styled.div`
  position: absolute;
  top: -12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 5;
`;

const ToolbarBtn = styled(Button)`
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 4px;
`;

const ReactionRow = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

const ReactionPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primary}10;
  }
`;

const BranchLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0.25rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export interface MessageItemProps {
  message: Message;
  isBranchActive?: boolean;
  onOpenBranch?: (messageId: string) => void;
  onAddReaction?: (emoji: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onRecallMessage?: (messageId: string) => void;
}

export function MessageItem({
  message,
  isBranchActive,
  onOpenBranch,
  onAddReaction,
  onEditMessage,
  onRecallMessage,
}: MessageItemProps) {
  const navigate = useNavigate();
  const { members, currentUser, openUserProfile, openBranch } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  // Popover state
  const [showMemberPopover, setShowMemberPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const replyCount = message.branchReplies ? message.branchReplies.length : 0;
  const isUnread = !!(message.unreadCount && message.unreadCount > 0);

  // Find sender profile or fallback
  const senderProfile =
    members.find((m) => m.id === message.senderId) ||
    (message.senderId === currentUser.id ? currentUser : null) || {
      id: message.senderId,
      display_name: message.senderName,
      account_name: message.senderId,
      phone_number: '+84900000000',
      status: 'on' as const,
      last_online_time: 'Just now',
    };

  const handleMouseEnterSender = (e: React.MouseEvent<HTMLElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 4, left: rect.left });
    setShowMemberPopover(true);
  };

  const handleMouseLeaveSender = () => {
    timeoutRef.current = setTimeout(() => {
      setShowMemberPopover(false);
    }, 200);
  };

  const handleMouseEnterPopover = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowMemberPopover(true);
  };

  const handleMouseLeavePopover = () => {
    timeoutRef.current = setTimeout(() => {
      setShowMemberPopover(false);
    }, 200);
  };

  const handleUserClick = () => {
    setShowMemberPopover(false);
    openUserProfile(senderProfile);
  };

  const handleBranchClick = () => {
    if (onOpenBranch) {
      onOpenBranch(message.id);
    } else {
      openBranch(message.id);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    if (onEditMessage) onEditMessage(message.id, editText);
    setIsEditing(false);
  };

  return (
    <MessageRow
      $isBranchActive={isBranchActive}
      $isRecalled={message.isRecalled}
      $isUnread={isUnread}
    >
      {/* AVATAR */}
      <Avatar
        onMouseEnter={handleMouseEnterSender}
        onMouseLeave={handleMouseLeaveSender}
        onClick={handleUserClick}
      >
        {message.senderName.charAt(0)}
      </Avatar>

      {/* MAIN CONTENT AREA */}
      <MainContent>
        <HeaderRow>
          <div
            onMouseEnter={handleMouseEnterSender}
            onMouseLeave={handleMouseLeaveSender}
            onClick={handleUserClick}
            style={{ display: 'inline-block' }}
          >
            <SenderName weight="bold" size="sm">
              {message.senderName}
            </SenderName>
          </div>

          <Text size="xs" colorVariant="secondary">
            {message.timestamp} {message.isEdited && !message.isRecalled && '(edited)'}
          </Text>
        </HeaderRow>

        {/* CONTENT OR EDIT FORM */}
        {message.isRecalled ? (
          <RecalledText>🚫 {message.text}</RecalledText>
        ) : isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ fontSize: '13px', padding: '0.25rem 0.5rem' }}
            />
            <Button variant="primary" size="sm" type="submit">Save</Button>
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
          </form>
        ) : (
          <ContentArea>{renderFormattedText(message.text)}</ContentArea>
        )}

        {/* REACTIONS */}
        {!message.isRecalled && message.reactions && message.reactions.length > 0 && (
          <ReactionRow>
            {message.reactions.map((r, idx) => (
              <ReactionPill
                key={idx}
                onClick={() => onAddReaction && onAddReaction(r.emoji)}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </ReactionPill>
            ))}
          </ReactionRow>
        )}

        {/* BRANCH REPLIES LINK */}
        {!message.isRecalled && replyCount > 0 && (
          <div>
            <BranchLink onClick={handleBranchClick}>
              💬 {replyCount} branch replies
            </BranchLink>
          </div>
        )}
      </MainContent>

      {/* FLOATING ACTION TOOLBAR */}
      {!message.isRecalled && (
        <FloatingToolbar className="message-toolbar">
          <ToolbarBtn variant="ghost" onClick={handleBranchClick} title="Reply in Branch">
            💬 Branch
          </ToolbarBtn>

          {onEditMessage && (
            <ToolbarBtn
              variant="ghost"
              onClick={() => {
                setEditText(message.text);
                setIsEditing(true);
              }}
              title="Edit Message"
            >
              ✏️ Edit
            </ToolbarBtn>
          )}

          {onRecallMessage && (
            <ToolbarBtn
              variant="ghost"
              onClick={() => onRecallMessage(message.id)}
              title="Recall Message"
              style={{ color: '#ef4444' }}
            >
              ↩️ Recall
            </ToolbarBtn>
          )}

          {onAddReaction && (
            <>
              <ToolbarBtn variant="ghost" onClick={() => onAddReaction('👍')}>👍</ToolbarBtn>
              <ToolbarBtn variant="ghost" onClick={() => onAddReaction('❤️')}>❤️</ToolbarBtn>
              <ToolbarBtn variant="ghost" onClick={() => onAddReaction('🔥')}>🔥</ToolbarBtn>
            </>
          )}
        </FloatingToolbar>
      )}

      {/* MEMBER MINI PROFILE POPOVER */}
      {showMemberPopover && (
        <MemberMiniProfilePopover
          member={senderProfile}
          position={popoverPos}
          onMouseEnter={handleMouseEnterPopover}
          onMouseLeave={handleMouseLeavePopover}
          onSendDM={(userId) => {
            setShowMemberPopover(false);
            navigate(`/app/dm/${userId}`);
          }}
          onViewProfile={(mem) => {
            setShowMemberPopover(false);
            openUserProfile(mem);
          }}
        />
      )}
    </MessageRow>
  );
}
