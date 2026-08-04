import styled from 'styled-components';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1.5rem;
`;

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthContainer>{children}</AuthContainer>;
}
