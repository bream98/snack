import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, Button, Input, Heading, Text } from '../../design-system';

const RegisterCard = styled(Card)`
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

export function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu nhập lại không trùng khớp');
      return;
    }

    try {
      // 1. Register
      await register(displayName, phone, password);
      // 2. Auto-login on success
      await login(phone, password);
      navigate('/');
    } catch {
      // Error handled in store
    }
  };

  const activeError = localError || error;

  return (
    <RegisterCard glass>
      <div style={{ textAlign: 'center' }}>
        <Heading size="2xl" weight="extrabold" colorVariant="primary">
          TẠO TÀI KHOẢN
        </Heading>
        <Text size="sm" colorVariant="secondary" style={{ marginTop: '0.25rem' }}>
          Đăng ký sử dụng nền tảng Snack Workspace
        </Text>
      </div>

      {activeError && <ErrorAlert>{activeError}</ErrorAlert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Tên hiển thị
          </Text>
          <Input
            type="text"
            placeholder="Nam Luong"
            value={displayName}
            onChange={(e) => {
              clearError();
              setLocalError(null);
              setDisplayName(e.target.value);
            }}
            required
          />
        </div>

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
              setLocalError(null);
              setPhone(e.target.value);
            }}
            required
          />
        </div>

        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Mật khẩu (ít nhất 6 ký tự)
          </Text>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              clearError();
              setLocalError(null);
              setPassword(e.target.value);
            }}
            required
          />
        </div>

        <div>
          <Text size="sm" weight="semibold" style={{ marginBottom: '0.375rem' }}>
            Xác nhận mật khẩu
          </Text>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              clearError();
              setLocalError(null);
              setConfirmPassword(e.target.value);
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
          {isLoading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <Text size="sm" colorVariant="secondary">
          Đã có tài khoản?
          <SwitchLink type="button" onClick={() => navigate('/login')}>
            Đăng nhập ngay
          </SwitchLink>
        </Text>
      </div>
    </RegisterCard>
  );
}
