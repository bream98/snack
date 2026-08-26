import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store/useAuthStore';
import { Text } from '../../design-system';

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
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const displayName = user?.display_name || 'Người dùng';

  return (
    <TopbarContainer>
      {/* Brand Logo */}
      <Brand onClick={() => navigate('/')}>
        FlyTalk
      </Brand>

      {/* User Info Chip -> Navigates to /profile */}
      <UserGroup>
        <UserProfileChip onClick={() => navigate('/profile')}>
          <Text size="sm" weight="semibold">
            {displayName}
          </Text>
        </UserProfileChip>
      </UserGroup>
    </TopbarContainer>
  );
}

export default Topbar;
