import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LogOut, User as UserIcon, Phone } from 'lucide-react';
import ReactNiceAvatar, { genConfig } from 'react-nice-avatar';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Card, Heading, Text } from '../../design-system';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.display_name || 'Người dùng';
  const phone = user?.phone || 'Chưa cập nhật';

  const avatarConfig = genConfig(`${displayName}_${user?.ID || ''}`);

  return (
    <PageContainer>
      <ProfileCard>
        <AvatarSection>
          <AvatarWrapper>
            <ReactNiceAvatar shape="square" style={{ width: '100%', height: '100%' }} {...avatarConfig} />
          </AvatarWrapper>
          <Heading size="xl" weight="bold">
            {displayName}
          </Heading>
          <Text size="sm" colorVariant="secondary">
            Thông tin tài khoản cá nhân
          </Text>
        </AvatarSection>

        <InfoSection>
          <InfoRow>
            <IconBox>
              <UserIcon size={18} />
            </IconBox>
            <div>
              <Text size="xs" colorVariant="secondary">
                Họ và tên
              </Text>
              <Text size="sm" weight="semibold">
                {displayName}
              </Text>
            </div>
          </InfoRow>

          <InfoRow>
            <IconBox>
              <Phone size={18} />
            </IconBox>
            <div>
              <Text size="xs" colorVariant="secondary">
                Số điện thoại
              </Text>
              <Text size="sm" weight="semibold">
                {phone}
              </Text>
            </div>
          </InfoRow>
        </InfoSection>

        <LogoutButton onClick={handleLogout}>
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </LogoutButton>
      </ProfileCard>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ProfileCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 16px;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
`;

const AvatarWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const LogoutButton = styled(Button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.danger};
  color: #ffffff;
  border: none;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;
