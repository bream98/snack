import { useState } from 'react';
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

const InviteFeed = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 2px;
`;

const InviteItem = styled.div`
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface InvitationModalProps {
  onClose: () => void;
}

export function InvitationModal({ onClose }: InvitationModalProps) {
  const [invitations, setInvitations] = useState([
    { id: 'inv-1', inviter: 'Alex Johnson', target: 'channel #engineering', time: '10m ago' },
    { id: 'inv-2', inviter: 'Sarah Connor', target: 'Workspace "Snack Tech HQ"', time: '1h ago' },
  ]);

  const handleAction = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  return ReactDOM.createPortal(
    <ModalBackdrop onClick={onClose}>
      <ModalCard glass onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading size="lg" weight="bold">📩 Invitations</Heading>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '2px 6px' }}>
            ✕
          </Button>
        </div>

        <InviteFeed>
          {invitations.length === 0 ? (
            <Text size="xs" colorVariant="secondary" style={{ textAlign: 'center', padding: '1rem 0' }}>
              No pending invitations
            </Text>
          ) : (
            invitations.map((inv) => (
              <InviteItem key={inv.id}>
                <div>
                  <Text weight="bold" size="xs" colorVariant="primary">{inv.inviter}</Text>
                  <Text size="xs"> invited you to <strong>{inv.target}</strong></Text>
                  <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px', marginTop: '2px' }}>{inv.time}</Text>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="primary" size="sm" onClick={() => handleAction(inv.id)} style={{ padding: '4px 12px', fontSize: '12px' }}>
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction(inv.id)} style={{ padding: '4px 12px', fontSize: '12px' }}>
                    Decline
                  </Button>
                </div>
              </InviteItem>
            ))
          )}
        </InviteFeed>
      </ModalCard>
    </ModalBackdrop>,
    document.body
  );
}
