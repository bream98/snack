import styled, { css } from 'styled-components';

export interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  colorVariant?: 'default' | 'secondary' | 'primary' | 'danger';
  $size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  $weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  $colorVariant?: 'default' | 'secondary' | 'primary' | 'danger';
}

export const Text = styled.p.attrs<TextProps>((props) => ({
  $size: props.$size ?? props.size ?? 'base',
  $weight: props.$weight ?? props.weight ?? 'regular',
  $colorVariant: props.$colorVariant ?? props.colorVariant ?? 'default',
}))<TextProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ $size = 'base', theme }) => theme.typography.fontSize[$size]};
  font-weight: ${({ $weight = 'regular', theme }) => theme.typography.fontWeight[$weight]};

  ${({ $colorVariant = 'default', theme }) => {
    switch ($colorVariant) {
      case 'secondary':
        return css`
          color: ${theme.colors.textSecondary};
        `;
      case 'primary':
        return css`
          color: ${theme.colors.primary};
        `;
      case 'danger':
        return css`
          color: ${theme.colors.danger};
        `;
      default:
        return css`
          color: ${theme.colors.text};
        `;
    }
  }}
`;

export const Heading = styled(Text).attrs({ as: 'h2' })<TextProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
`;
