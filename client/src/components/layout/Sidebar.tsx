import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Card, Text, Button } from '../../design-system';
import { useChatStore } from '../../store/useChatStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { ActivityPopover } from './ActivityPopover';
import { InvitationPopover } from './InvitationPopover';

const SidebarContainer = styled(Card)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
`;

const SidebarHeaderMobile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary + '1a' : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + '0d'};
  }
`;

const Badge = styled.span`
  background-color: ${({ theme }) => theme.colors.danger};
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
`;

const StatusDot = styled.span<{ $isOn: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $isOn, theme }) =>
    $isOn ? theme.colors.success : theme.colors.textSecondary};
`;

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { channels, members } = useChatStore();
  const { toggleSidebar } = useNavigationStore();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  const [popoverPos, setPopoverPos] = useState({ top: 110, left: 248 });

  const activityItemRef = useRef<HTMLDivElement>(null);
  const invitationItemRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (path: string) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const toggleActivity = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ top: rect.top, left: rect.right + 8 });
    setIsInvitationOpen(false);
    setIsActivityOpen((prev) => !prev);
  };

  const toggleInvitation = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ top: rect.top, left: rect.right + 8 });
    setIsActivityOpen(false);
    setIsInvitationOpen((prev) => !prev);
  };

  return (
    <SidebarContainer glass>
      {/* Mobile Close Button Header */}
      <SidebarHeaderMobile>
        <Text size="xs" weight="bold" colorVariant="primary">
          MENU
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          style={{ padding: '2px 6px', fontSize: '13px' }}
          title="Đóng sidebar"
        >
          ✕
        </Button>
      </SidebarHeaderMobile>

      {/* 📌 FEATURES */}
      <SectionBox>
        <Text size="xs" weight="bold" colorVariant="secondary">
          FEATURES
        </Text>
        <NavItem
          $isActive={location.pathname === '/app/profile'}
          onClick={() => handleItemClick('/app/profile')}
        >
          <span>👤 Profile</span>
        </NavItem>

        <NavItem
          ref={activityItemRef}
          $isActive={isActivityOpen}
          onClick={toggleActivity}
        >
          <span>⚡ Activity</span>
          <Badge>3 new</Badge>
        </NavItem>

        <NavItem
          ref={invitationItemRef}
          $isActive={isInvitationOpen}
          onClick={toggleInvitation}
        >
          <span>📩 Invitations</span>
          <Badge style={{ backgroundColor: '#3b82f6' }}>2 new</Badge>
        </NavItem>

        <NavItem
          $isActive={location.pathname === '/app/settings'}
          onClick={() => handleItemClick('/app/settings')}
        >
          <span>⚙️ Settings</span>
        </NavItem>
      </SectionBox>

      {/* ACTIVITY POPOVER */}
      {isActivityOpen && (
        <ActivityPopover
          position={popoverPos}
          onClose={() => setIsActivityOpen(false)}
        />
      )}

      {/* INVITATION POPOVER */}
      {isInvitationOpen && (
        <InvitationPopover
          position={popoverPos}
          onClose={() => setIsInvitationOpen(false)}
        />
      )}

      {/* CHANNEL MESSAGE */}
      <SectionBox>
        <Text size="xs" weight="bold" colorVariant="secondary">
          Channel Message
        </Text>
        {channels.map((ch) => (
          <NavItem
            key={ch.id}
            $isActive={location.pathname === `/app/cm/${ch.id}`}
            onClick={() => handleItemClick(`/app/cm/${ch.id}`)}
          >
            <span># {ch.name}</span>
          </NavItem>
        ))}
      </SectionBox>

      {/* DIRECT MESSAGE */}
      <SectionBox>
        <Text size="xs" weight="bold" colorVariant="secondary">
          Direct Message
        </Text>
        {members.map((m) => (
          <NavItem
            key={m.id}
            $isActive={location.pathname === `/app/dm/${m.id}`}
            onClick={() => handleItemClick(`/app/dm/${m.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusDot $isOn={m.status === 'on'} />
              <span>{m.display_name}</span>
            </div>
          </NavItem>
        ))}
      </SectionBox>
    </SidebarContainer>
  );
}
