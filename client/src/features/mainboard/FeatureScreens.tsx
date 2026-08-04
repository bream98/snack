import { Card, Heading, Text } from '../../design-system';

export function ProfileScreen() {
  return (
    <Card glass style={{ maxWidth: '400px' }}>
      <Heading size="lg" weight="bold">Profile Skeleton</Heading>
      <Text size="sm" colorVariant="secondary">Thông tin tài khoản cá nhân</Text>
    </Card>
  );
}

export function ActivityScreen() {
  return (
    <Card glass style={{ maxWidth: '400px' }}>
      <Heading size="lg" weight="bold">Activity Skeleton</Heading>
      <Text size="sm" colorVariant="secondary">Nhật ký thông báo & nhắc tới</Text>
    </Card>
  );
}

export function SettingsScreen() {
  return (
    <Card glass style={{ maxWidth: '400px' }}>
      <Heading size="lg" weight="bold">Settings Skeleton</Heading>
      <Text size="sm" colorVariant="secondary">Cấu hình workspace & giao diện</Text>
    </Card>
  );
}
