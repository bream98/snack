import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card, Text, Button } from '../../design-system';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const TopbarContainer = styled(Card)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-sizing: border-box;
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

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const AvatarCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #6366f1;
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <TopbarContainer glass>
      {/* Brand Logo */}
      <Brand onClick={() => navigate('/app/cm/general')}>
        <span>🍿</span>
        <span>Snack</span>
      </Brand>

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
          style={{ fontSize: '12px', padding: '2px 8px' }}
        >
          Logout
        </Button>
      </UserArea>
    </TopbarContainer>
  );
}
