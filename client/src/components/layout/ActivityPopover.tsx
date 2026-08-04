import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading } from '../../design-system';

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

const ActivityItem = styled.div`
  padding: 0.625rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface ActivityPopoverProps {
  position?: { top: number; left: number };
  onClose: () => void;
}

export function ActivityPopover({ position = { top: 110, left: 248 }, onClose }: ActivityPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const activities = [
    { id: '1', user: 'Alex Johnson', action: 'mentioned you in', target: '#general', time: '5m ago' },
    { id: '2', user: 'Sarah Connor', action: 'reacted ❤️ to your message in', target: '#random', time: '20m ago' },
    { id: '3', user: 'Alex Johnson', action: 'replied in Branch', target: '#general', time: '1h ago' },
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
        <Heading size="sm" weight="bold">⚡ Activity</Heading>
        <Text size="xs" colorVariant="secondary" style={{ cursor: 'pointer' }} onClick={onClose}>✕</Text>
      </div>

      {activities.map((item) => (
        <ActivityItem key={item.id}>
          <div>
            <Text weight="bold" size="xs" colorVariant="primary">{item.user}</Text>
            <Text size="xs">{item.action} <strong>{item.target}</strong></Text>
          </div>
          <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px' }}>{item.time}</Text>
        </ActivityItem>
      ))}
    </PopoverContainer>
  );

  return ReactDOM.createPortal(content, document.body);
}
