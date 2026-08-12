import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Text, Button } from '../../design-system';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useNavigationStore } from '../../store/useNavigationStore';

/* Color-Defined Borderless Topbar Header */
const TopbarContainer = styled.header`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 0;
  border: none;
`;

const LeftHeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SidebarToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.15rem;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.textSecondary}15;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.textSecondary}12;
  }
`;

const AvatarCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
`;

export function Topbar() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { currentUser } = useChatStore();
  const { toggleSidebar } = useNavigationStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <TopbarContainer>
      <LeftHeaderGroup>
        {/* Sidebar Toggle Button */}
        <SidebarToggleBtn onClick={toggleSidebar} title="Toggle Sidebar">
          ☰
        </SidebarToggleBtn>

        {/* Brand Logo */}
        <Brand onClick={() => navigate('/app/cm/general')}>
          <span>🍿</span>
          <span>Snack</span>
        </Brand>
      </LeftHeaderGroup>

      {/* User Actions */}
      <UserArea>
        <UserBadge onClick={() => navigate('/app/profile')}>
          <AvatarCircle>{currentUser.display_name.charAt(0)}</AvatarCircle>
          <Text size="xs" weight="bold">
            {currentUser.display_name}
          </Text>
        </UserBadge>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          style={{ fontSize: '12px', padding: '3px 10px', border: 'none', backgroundColor: '#f1f3f4' }}
        >
          Logout
        </Button>
      </UserArea>
    </TopbarContainer>
  );
}
