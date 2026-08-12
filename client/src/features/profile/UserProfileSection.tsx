import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Text, Heading, Button } from '../../design-system';
import type { Member } from '../../store/useChatStore';
import { useChatStore } from '../../store/useChatStore';

/* Color-Defined Borderless User Profile Panel */
const SubContentContainer = styled.aside`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
  border-radius: 0;
  border: none;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
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

  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const HeaderBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.875rem;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 0.875rem;
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const LargeAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.35rem;
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ $isOn: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $isOn, theme }) =>
    $isOn ? `${theme.colors.success}20` : `${theme.colors.textSecondary}20`};
  color: ${({ $isOn, theme }) =>
    $isOn ? theme.colors.success : theme.colors.textSecondary};
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border: none;
`;

export interface UserProfileSectionProps {
  user: Member;
  onClose: () => void;
}

export function UserProfileSection({ user, onClose }: UserProfileSectionProps) {
  const navigate = useNavigate();
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

  const handleSendDM = () => {
    onClose();
    navigate(`/app/dm/${user.id}`);
  };

  return (
    <SubContentContainer>
      {/* Drag Resize Handle */}
      <ResizeHandle onMouseDown={handleMouseDown} title="Drag to resize" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="sm" weight="bold">
          👤 User Profile
        </Heading>
        <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '2px 6px' }}>
          ✕
        </Button>
      </div>

      {/* Banner */}
      <HeaderBanner>
        <LargeAvatar>{user.display_name.charAt(0)}</LargeAvatar>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Heading size="lg" weight="bold">
            {user.display_name}
          </Heading>
          <Text size="xs" colorVariant="secondary">
            @{user.account_name}
          </Text>
          <div>
            <StatusBadge $isOn={user.status === 'on'}>
              {user.status === 'on' ? '🟢 Online' : '⚪ Offline'}{' '}
              {user.last_online_time && `(${user.last_online_time})`}
            </StatusBadge>
          </div>
        </div>
      </HeaderBanner>

      {/* Details */}
      <InfoCard>
        <Text size="xs" colorVariant="secondary">
          ACCOUNT NAME
        </Text>
        <Text size="sm" weight="bold">
          @{user.account_name}
        </Text>
      </InfoCard>

      <InfoCard>
        <Text size="xs" colorVariant="secondary">
          PHONE NUMBER
        </Text>
        <Text size="sm" weight="bold">
          {user.phone_number}
        </Text>
      </InfoCard>

      <InfoCard>
        <Text size="xs" colorVariant="secondary">
          STATUS
        </Text>
        <Text size="sm" weight="bold">
          {user.status === 'on' ? '🟢 Online (Active)' : '⚪ Offline'}{' '}
          <span style={{ fontSize: '11px', color: '#5f6368' }}>
            {user.last_online_time && `(${user.last_online_time})`}
          </span>
        </Text>
      </InfoCard>

      {/* Direct Message Action Button */}
      <Button variant="primary" onClick={handleSendDM} style={{ marginTop: 'auto' }}>
        💬 Direct Message
      </Button>
    </SubContentContainer>
  );
}
