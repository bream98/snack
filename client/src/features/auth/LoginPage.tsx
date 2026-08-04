import { useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, Button, Input, Heading, Text } from '../../design-system';

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2.5rem 2rem;
`;

export function LoginPage() {
  const [email, setEmail] = useState('nam.luong@example.com');
  const [password, setPassword] = useState('123456');
  const { login } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) login(email);
  };

  return (
    <LoginCard glass>
      <div style={{ textAlign: 'center' }}>
        <Heading size="2xl" weight="extrabold" colorVariant="primary">
          SNACK WORKSPACE
        </Heading>
        <Text size="sm" colorVariant="secondary" style={{ marginTop: '0.25rem' }}>
          Đăng nhập hệ thống quản lý công việc Kanban
        </Text>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Email đăng nhập
          </Text>
          <Input
            type="email"
            placeholder="nhap.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Mật khẩu
          </Text>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button variant="primary" size="lg" type="submit" fullWidth style={{ marginTop: '0.5rem' }}>
          Đăng nhập Workspace
        </Button>
      </form>
    </LoginCard>
  );
}
