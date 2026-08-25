import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Text } from '../../design-system';

const TopbarContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const UserGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserProfileChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.background};
`;


export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.display_name || 'Người dùng';

  return (
    <TopbarContainer>
      {/* Brand Logo */}
      <Brand onClick={() => navigate('/')}>
        FlyTalk
      </Brand>

      {/* User Info & Logout Button */}
      <UserGroup>
        <UserProfileChip>
          <Text size="sm" weight="semibold">
            {displayName}
          </Text>
        </UserProfileChip>

        <Button
          size="sm"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          <span>Đăng xuất</span>
        </Button>
      </UserGroup>
    </TopbarContainer>
  );
}

export default Topbar;
