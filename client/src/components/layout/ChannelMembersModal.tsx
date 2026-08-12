import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading, Input, Button } from '../../design-system';
import type { Member } from '../../store/useChatStore';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(32, 33, 36, 0.4);
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Google Material 3 Dialog (16px radius, flat background) */
const ModalCard = styled(Card)`
  width: 440px;
  max-width: calc(100vw - 2rem);
  max-height: 580px;
  overflow: hidden;
  z-index: 99999;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.375rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
`;

const TabButton = styled.button<{ $isActive?: boolean }>`
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : 'transparent')};
  background-color: ${({ $isActive, theme }) => ($isActive ? `${theme.colors.primary}18` : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}12`};
  }
`;

const MemberListFeed = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-right: 2px;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
`;

const AvatarCircle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
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

export interface ChannelMembersModalProps {
  channelName: string;
  members: Member[];
  onClose: () => void;
  onRemoveMember: (memberId: string) => void;
}

export function ChannelMembersModal({
  channelName,
  members,
  onClose,
  onRemoveMember,
}: ChannelMembersModalProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'offline'>('all');

  const onlineCount = members.filter((m) => m.status === 'on').length;
  const offlineCount = members.filter((m) => m.status === 'off').length;

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.display_name.toLowerCase().includes(search.toLowerCase()) ||
      m.account_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'online') return m.status === 'on';
    if (activeTab === 'offline') return m.status === 'off';
    return true;
  });

  return ReactDOM.createPortal(
    <ModalBackdrop onClick={onClose}>
      <ModalCard glass onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading size="lg" weight="bold">
            👥 Members — #{channelName}
          </Heading>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '2px 6px' }}>
            ✕
          </Button>
        </div>

        {/* Search input */}
        <Input
          placeholder="🔍 Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: '13px', padding: '0.4rem 0.6rem' }}
        />

        {/* Filter Tabs */}
        <FilterTabs>
          <TabButton $isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All ({members.length})
          </TabButton>
          <TabButton $isActive={activeTab === 'online'} onClick={() => setActiveTab('online')}>
            🟢 Online ({onlineCount})
          </TabButton>
          <TabButton $isActive={activeTab === 'offline'} onClick={() => setActiveTab('offline')}>
            ⚪ Offline ({offlineCount})
          </TabButton>
        </FilterTabs>

        {/* Member List Feed */}
        <MemberListFeed>
          {filtered.map((m) => (
            <MemberRow key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <AvatarWrapper>
                  <AvatarCircle>{m.display_name.charAt(0)}</AvatarCircle>
                  <StatusDot $isOn={m.status === 'on'} />
                </AvatarWrapper>
                <div>
                  <Text weight="bold" size="xs">
                    {m.display_name}
                  </Text>
                  <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px' }}>
                    @{m.account_name}
                    {m.status === 'off' && m.last_online_time && (
                      <span style={{ color: '#70757a', marginLeft: '4px' }}>
                        • Active {m.last_online_time}
                      </span>
                    )}
                  </Text>
                </div>
              </div>

              {/* Remove button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveMember(m.id)}
                style={{ fontSize: '11px', padding: '2px 10px', color: '#d93025', borderColor: '#fce8e6' }}
              >
                🚫 Remove
              </Button>
            </MemberRow>
          ))}
        </MemberListFeed>
      </ModalCard>
    </ModalBackdrop>,
    document.body
  );
}
