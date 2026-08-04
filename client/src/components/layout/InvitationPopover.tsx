import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading, Button } from '../../design-system';

const PopoverContainer = styled(Card)`
  position: fixed;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 9999;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    left: 1rem !important;
    top: 70px !important;
    width: calc(100vw - 2rem);
  }
`;

const InviteItem = styled.div`
  padding: 0.625rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export interface InvitationPopoverProps {
  position: { top: number; left: number };
  onClose: () => void;
}

export function InvitationPopover({ position, onClose }: InvitationPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const invitations = [
    { id: 'inv-1', inviter: 'Alex Johnson', target: 'channel #engineering', time: '10m ago' },
    { id: 'inv-2', inviter: 'Sarah Connor', target: 'Workspace "Snack Tech HQ"', time: '1h ago' },
  ];

  // Non-blocking click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const content = (
    <PopoverContainer
      ref={containerRef}
      glass
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="sm" weight="bold">📩 Invitations</Heading>
        <Text size="xs" colorVariant="secondary" style={{ cursor: 'pointer' }} onClick={onClose}>✕</Text>
      </div>

      {invitations.map((inv) => (
        <InviteItem key={inv.id}>
          <div>
            <Text weight="bold" size="xs" colorVariant="primary">{inv.inviter}</Text>
            <Text size="xs">invited you to <strong>{inv.target}</strong></Text>
            <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px', marginTop: '2px' }}>{inv.time}</Text>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <Button variant="primary" size="sm" style={{ padding: '2px 8px', fontSize: '11px' }}>Accept</Button>
            <Button variant="outline" size="sm" style={{ padding: '2px 8px', fontSize: '11px' }}>Decline</Button>
          </div>
        </InviteItem>
      ))}
    </PopoverContainer>
  );

  return ReactDOM.createPortal(content, document.body);
}
