import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading, Button } from '../../design-system';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled(Card)`
  width: 440px;
  max-width: calc(100vw - 2rem);
  max-height: 520px;
  overflow: hidden;
  z-index: 99999;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  box-sizing: border-box;
`;

const ActivityFeed = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 2px;
`;

const ActivityItem = styled.div`
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface ActivityModalProps {
  onClose: () => void;
}

export function ActivityModal({ onClose }: ActivityModalProps) {
  const activities = [
    { id: '1', user: 'Alex Johnson', action: 'mentioned you in', target: '#general', time: '5m ago' },
    { id: '2', user: 'Sarah Connor', action: 'reacted ❤️ to your message in', target: '#random', time: '20m ago' },
    { id: '3', user: 'Alex Johnson', action: 'replied in Branch', target: '#general', time: '1h ago' },
  ];

  return ReactDOM.createPortal(
    <ModalBackdrop onClick={onClose}>
      <ModalCard glass onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading size="lg" weight="bold">⚡ Activity</Heading>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '2px 6px' }}>
            ✕
          </Button>
        </div>

        <ActivityFeed>
          {activities.map((item) => (
            <ActivityItem key={item.id}>
              <div>
                <Text weight="bold" size="xs" colorVariant="primary">{item.user}</Text>
                <Text size="xs"> {item.action} <strong>{item.target}</strong></Text>
              </div>
              <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px' }}>{item.time}</Text>
            </ActivityItem>
          ))}
        </ActivityFeed>
      </ModalCard>
    </ModalBackdrop>,
    document.body
  );
}
