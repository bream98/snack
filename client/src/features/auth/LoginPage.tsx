import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ErrorAlert = styled.div`
  background-color: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.875rem;
`;

const SwitchLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  margin-left: 0.375rem;

  &:hover {
    text-decoration: underline;
  }
`;

export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('0901234567');
  const [password, setPassword] = useState('123456');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(phone, password);
      navigate('/app/cm/general');
    } catch {
      // Error handles in store
    }
  };

  return (
    <LoginCard glass>
      <div style={{ textAlign: 'center' }}>
        <Heading size="2xl" weight="extrabold" colorVariant="primary">
          SNACK WORKSPACE
        </Heading>
        <Text size="sm" colorVariant="secondary" style={{ marginTop: '0.25rem' }}>
          Đăng nhập hệ thống quản lý giao tiếp & công việc
        </Text>
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Số điện thoại
          </Text>
          <Input
            type="tel"
            placeholder="0901234567"
            value={phone}
            onChange={(e) => {
              clearError();
              setPhone(e.target.value);
            }}
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
            onChange={(e) => {
              clearError();
              setPassword(e.target.value);
            }}
            required
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          fullWidth
          disabled={isLoading}
          style={{ marginTop: '0.5rem' }}
        >
          {isLoading ? 'Đang xác thực...' : 'Đăng nhập Workspace'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <Text size="sm" colorVariant="secondary">
          Chưa có tài khoản?
          <SwitchLink type="button" onClick={() => navigate('/auth/register')}>
            Đăng ký ngay
          </SwitchLink>
        </Text>
      </div>
    </LoginCard>
  );
}
