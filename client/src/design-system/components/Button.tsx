import styled, { css } from 'styled-components';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  $variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

export const Button = styled.button.attrs<ButtonProps>((props) => ({
  $variant: props.$variant ?? props.variant ?? 'primary',
  $size: props.$size ?? props.size ?? 'md',
  $fullWidth: props.$fullWidth ?? props.fullWidth ?? false,
}))<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  outline: none;
  border: 1px solid transparent;

  &:active {
    transform: scale(0.98);
  }

  ${({ $size = 'md', theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          font-size: ${theme.typography.fontSize.sm};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing[4]} ${theme.spacing[6]};
          font-size: ${theme.typography.fontSize.lg};
        `;
      default:
        return css`
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          font-size: ${theme.typography.fontSize.base};
        `;
    }
  }}

  ${({ $variant = 'primary', theme }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary};
          color: #ffffff;
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border-color: ${theme.colors.border};
          color: ${theme.colors.text};
          &:hover {
            background-color: ${theme.colors.surface};
            border-color: ${theme.colors.primary};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.text};
          &:hover {
            background-color: ${theme.colors.border};
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.danger};
          color: #ffffff;
          &:hover {
            opacity: 0.9;
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.primary};
          color: #ffffff;
          &:hover {
            background-color: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;
