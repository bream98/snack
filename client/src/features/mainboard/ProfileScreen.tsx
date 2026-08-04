import { useState } from 'react';
import styled from 'styled-components';
import { Card, Text, Heading, Button, Input } from '../../design-system';
import { useChatStore } from '../../store/useChatStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 580px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const ProfileCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
`;

const HeaderBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const LargeAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const UserTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
`;

const InfoItemCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatusBadge = styled.span<{ $isOn: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${({ $isOn, theme }) =>
    $isOn ? `${theme.colors.success}20` : `${theme.colors.textSecondary}20`};
  color: ${({ $isOn, theme }) =>
    $isOn ? theme.colors.success : theme.colors.textSecondary};
`;

const FormSection = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

export function ProfileScreen() {
  const { currentUser, updateCurrentUserProfile } = useChatStore();
  const [displayName, setDisplayName] = useState(currentUser.display_name);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    updateCurrentUserProfile({ display_name: displayName });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <Container>
      <Heading size="lg" weight="bold">
        👤 Profile
      </Heading>

      <ProfileCard glass>
        {/* Banner Profile Header */}
        <HeaderBanner>
          <LargeAvatar>{currentUser.display_name.charAt(0)}</LargeAvatar>
          <UserTitleGroup>
            <Heading size="lg" weight="bold">
              {currentUser.display_name}
            </Heading>
            <Text size="xs" colorVariant="secondary">
              @{currentUser.account_name}
            </Text>
            <div>
              <StatusBadge $isOn={currentUser.status === 'on'}>
                {currentUser.status === 'on' ? '🟢 Online' : '⚪ Offline'}{' '}
                {currentUser.last_online_time && `(${currentUser.last_online_time})`}
              </StatusBadge>
            </div>
          </UserTitleGroup>
        </HeaderBanner>

        {/* Edit Form Section */}
        <FormSection onSubmit={handleSaveDisplayName}>
          <Text size="xs" weight="bold" colorVariant="primary">
            DISPLAY NAME
          </Text>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter new display name..."
              style={{ flex: 1 }}
            />
            <Button variant="primary" type="submit">
              {isSaved ? '✅ Saved!' : 'Save'}
            </Button>
          </div>
        </FormSection>

        {/* Basic Account Info Grid */}
        <div style={{ marginTop: '0.5rem' }}>
          <Text size="xs" weight="bold" colorVariant="secondary" style={{ marginBottom: '0.5rem' }}>
            ACCOUNT INFORMATION
          </Text>

          <InfoGrid>
            <InfoItemCard>
              <Text size="xs" colorVariant="secondary">
                👤 Account Name
              </Text>
              <Text size="sm" weight="bold">
                @{currentUser.account_name}
              </Text>
            </InfoItemCard>

            <InfoItemCard>
              <Text size="xs" colorVariant="secondary">
                📱 Phone Number
              </Text>
              <Text size="sm" weight="bold">
                {currentUser.phone_number}
              </Text>
            </InfoItemCard>
          </InfoGrid>
        </div>
      </ProfileCard>
    </Container>
  );
}
