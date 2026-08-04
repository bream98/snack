import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Card, Text, Heading, Input, Button } from '../../design-system';
import type { Member } from '../../store/useChatStore';
import { useChatStore } from '../../store/useChatStore';

const PopoverContainer = styled(Card)`
  position: fixed;
  width: 350px;
  max-height: 520px;
  overflow: hidden;
  z-index: 99999;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    right: 1rem !important;
    top: 70px !important;
    width: calc(100vw - 2rem);
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.375rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
`;

const TabButton = styled.button<{ $isActive?: boolean }>`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : 'transparent')};
  background-color: ${({ $isActive, theme }) => ($isActive ? `${theme.colors.primary}15` : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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
  padding: 0.5rem 0.625rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.15s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
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

export interface ChannelMembersPopoverProps {
  members: Member[];
  position: { top: number; left: number };
  onClose: () => void;
  onSendDM: (userId: string) => void;
}

export function ChannelMembersPopover({
  members,
  position,
  onClose,
  onSendDM,
}: ChannelMembersPopoverProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'offline'>('all');
  const { openUserProfile } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMemberClick = (member: Member) => {
    onClose();
    openUserProfile(member);
  };

  return ReactDOM.createPortal(
    <PopoverContainer
      ref={containerRef}
      glass
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="sm" weight="bold">👥 Members</Heading>
        <Text size="xs" colorVariant="secondary" style={{ cursor: 'pointer', padding: '2px 4px' }} onClick={onClose}>
          ✕
        </Text>
      </div>

      {/* Filter search input */}
      <Input
        placeholder="🔍 Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ fontSize: '12px', padding: '0.35rem 0.5rem' }}
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

      {/* Member Feed */}
      <MemberListFeed>
        {filtered.map((m) => (
          <MemberRow key={m.id} onClick={() => handleMemberClick(m)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <AvatarWrapper>
                <AvatarCircle>{m.display_name.charAt(0)}</AvatarCircle>
                <StatusDot $isOn={m.status === 'on'} />
              </AvatarWrapper>
              <div>
                <Text weight="bold" size="xs">{m.display_name}</Text>
                <Text size="xs" colorVariant="secondary" style={{ fontSize: '11px' }}>
                  @{m.account_name}
                  {m.status === 'off' && m.last_online_time && (
                    <span style={{ color: '#94a3b8', marginLeft: '4px' }}>
                      • Active {m.last_online_time}
                    </span>
                  )}
                </Text>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onSendDM(m.id);
              }}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              💬 Message
            </Button>
          </MemberRow>
        ))}
      </MemberListFeed>
    </PopoverContainer>,
    document.body
  );
}
