import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Text, Button } from '../../design-system';
import { useChatStore } from '../../store/useChatStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { ActivityModal } from './ActivityModal';
import { InvitationModal } from './InvitationModal';

/* Color-Defined Borderless Sidebar Drawer Panel */
const SidebarContainer = styled.aside`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.75rem 0.5rem;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
  border-radius: 0;
  border: none;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
`;

const SidebarHeaderMobile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem 0.5rem 0.5rem;
`;

const SectionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

/* Consistent Google Pill NavItem */
const NavItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '400')};
  background-color: ${({ $isActive, theme }) =>
    $isActive ? `${theme.colors.primary}18` : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.text};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ $isActive, theme }) =>
      $isActive ? `${theme.colors.primary}20` : `${theme.colors.textSecondary}15`};
  }
`;

const Badge = styled.span`
  background-color: ${({ theme }) => theme.colors.danger};
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
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

  const handleItemClick = (path: string) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const toggleActivity = () => {
    setIsInvitationOpen(false);
    setIsActivityOpen((prev) => !prev);
  };

  const toggleInvitation = () => {
    setIsActivityOpen(false);
    setIsInvitationOpen((prev) => !prev);
  };

  return (
    <SidebarContainer>
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
          title="Close sidebar"
        >
          ✕
        </Button>
      </SidebarHeaderMobile>

      {/* 📌 FEATURES */}
      <SectionBox>
        <Text size="xs" weight="bold" colorVariant="secondary" style={{ paddingLeft: '0.75rem', marginBottom: '0.25rem' }}>
          FEATURES
        </Text>
        <NavItem
          $isActive={location.pathname === '/app/profile'}
          onClick={() => handleItemClick('/app/profile')}
        >
          <span>👤 Profile</span>
        </NavItem>

        <NavItem
          $isActive={isActivityOpen}
          onClick={toggleActivity}
        >
          <span>⚡ Activity</span>
          <Badge>3 new</Badge>
        </NavItem>

        <NavItem
          $isActive={isInvitationOpen}
          onClick={toggleInvitation}
        >
          <span>📩 Invitations</span>
          <Badge style={{ backgroundColor: '#1a73e8' }}>2 new</Badge>
        </NavItem>

        <NavItem
          $isActive={location.pathname === '/app/settings'}
          onClick={() => handleItemClick('/app/settings')}
        >
          <span>⚙️ Settings</span>
        </NavItem>
      </SectionBox>

      {/* ACTIVITY MODAL */}
      {isActivityOpen && (
        <ActivityModal
          onClose={() => setIsActivityOpen(false)}
        />
      )}

      {/* INVITATION MODAL */}
      {isInvitationOpen && (
        <InvitationModal
          onClose={() => setIsInvitationOpen(false)}
        />
      )}

      {/* CHANNEL MESSAGE */}
      <SectionBox>
        <Text size="xs" weight="bold" colorVariant="secondary" style={{ paddingLeft: '0.75rem', marginBottom: '0.25rem' }}>
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
        <Text size="xs" weight="bold" colorVariant="secondary" style={{ paddingLeft: '0.75rem', marginBottom: '0.25rem' }}>
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
