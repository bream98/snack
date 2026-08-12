import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text } from '../../design-system';

const MenuCard = styled(Card)`
  position: fixed;
  width: 240px;
  z-index: 99999;
  padding: 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.625rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.625rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  font-weight: 500;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.text)};
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ $danger, theme }) =>
      $danger ? `${theme.colors.danger}15` : `${theme.colors.primary}15`};
  }
`;

export interface ChannelMenuProps {
  channelName: string;
  createdTime?: string;
  createdBy?: string;
  memberCount: number;
  position: { top: number; left: number };
  onClose: () => void;
  onOpenMembersModal: () => void;
  onLeaveChannel: () => void;
}

export function ChannelMenu({
  channelName,
  createdTime = 'Oct 15, 2025',
  createdBy = 'Nam Luong',
  memberCount,
  position,
  onClose,
  onOpenMembersModal,
  onLeaveChannel,
}: ChannelMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Non-blocking click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const content = (
    <MenuCard
      ref={menuRef}
      glass
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {/* 📌 Channel Information Metadata Section */}
      <InfoBox>
        <Text size="xs" weight="bold" colorVariant="primary">
          #{channelName}
        </Text>
        <InfoRow>
          <Text size="xs" colorVariant="secondary">Created time:</Text>
          <Text size="xs" weight="bold">{createdTime}</Text>
        </InfoRow>
        <InfoRow>
          <Text size="xs" colorVariant="secondary">Created by:</Text>
          <Text size="xs" weight="bold">{createdBy}</Text>
        </InfoRow>
        <InfoRow>
          <Text size="xs" colorVariant="secondary">Members:</Text>
          <Text size="xs" weight="bold">{memberCount} members</Text>
        </InfoRow>
      </InfoBox>

      {/* Menu Actions */}
      <MenuItem
        onClick={() => {
          onClose();
          onOpenMembersModal();
        }}
      >
        <span>👥</span>
        <span>Members ({memberCount})</span>
      </MenuItem>

      <div style={{ height: '1px', backgroundColor: '#dadce0', margin: '1px 0' }} />

      <MenuItem
        $danger
        onClick={() => {
          onClose();
          onLeaveChannel();
        }}
      >
        <span>🚪</span>
        <span>Leave Channel</span>
      </MenuItem>
    </MenuCard>
  );

  return ReactDOM.createPortal(content, document.body);
}
