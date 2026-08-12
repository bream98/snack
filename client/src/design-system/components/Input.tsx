import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.pill}; /* Google Material Pill Input */
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 0.875rem;
  transition: ${({ theme }) => theme.transitions.fast};
  outline: none;
  box-shadow: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;
