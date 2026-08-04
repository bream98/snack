import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading, Button } from '../../design-system';
import type { Member } from '../../store/useChatStore';

const PopoverCard = styled(Card)`
  position: fixed;
  width: 250px;
  z-index: 99999;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
`;

const AvatarCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const StatusDot = styled.span<{ $isOn: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  background-color: ${({ $isOn, theme }) =>
    $isOn ? theme.colors.success : theme.colors.textSecondary};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.25rem;
`;

export interface MemberMiniProfileProps {
  member: Member;
  position: { top: number; left: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSendDM?: (userId: string) => void;
  onViewProfile?: (member: Member) => void;
}

export function MemberMiniProfilePopover({
  member,
  position,
  onMouseEnter,
  onMouseLeave,
  onSendDM,
  onViewProfile,
}: MemberMiniProfileProps) {
  const content = (
    <PopoverCard
      glass
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <HeaderRow>
        <AvatarWrapper>
          <AvatarCircle>{member.display_name.charAt(0)}</AvatarCircle>
          <StatusDot $isOn={member.status === 'on'} />
        </AvatarWrapper>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <Heading size="sm" weight="bold">
            {member.display_name}
          </Heading>
          <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px' }}>
            @{member.account_name}
          </Text>
        </div>
      </HeaderRow>

      <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px', marginTop: '2px' }}>
        {member.status === 'on' ? '🟢 Online' : '⚪ Offline'}{' '}
        {member.status === 'off' && member.last_online_time && `• Active ${member.last_online_time}`}
      </Text>

      <ActionRow>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSendDM && onSendDM(member.id)}
          style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
        >
          💬 Message
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile && onViewProfile(member)}
          style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
        >
          👤 Profile
        </Button>
      </ActionRow>
    </PopoverCard>
  );

  return ReactDOM.createPortal(content, document.body);
}
