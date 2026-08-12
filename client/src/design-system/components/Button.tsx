import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: css`
    padding: 0.35rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
  `,
  md: css`
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  `,
  lg: css`
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
    font-weight: 500;
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.pill}; /* Google Pill Button Shape */
  transition: ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  border: 1px solid transparent;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  box-shadow: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};

  ${({ size = 'md' }) => sizeStyles[size]}

  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary};
          color: #ffffff;
          &:hover {
            background-color: ${theme.colors.primaryHover};
          }
          &:active {
            background-color: ${theme.colors.primaryHover};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.textSecondary}18;
          color: ${theme.colors.text};
          &:hover {
            background-color: ${theme.colors.textSecondary}30;
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border-color: ${theme.colors.border};
          color: ${theme.colors.primary};
          &:hover {
            background-color: ${theme.colors.primary}0d;
            border-color: ${theme.colors.primary};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.textSecondary};
          border-radius: ${theme.radii.sm};
          &:hover {
            background-color: ${theme.colors.textSecondary}15;
            color: ${theme.colors.text};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
