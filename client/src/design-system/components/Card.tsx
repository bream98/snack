import styled, { css } from 'styled-components';

export interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  glass?: boolean;
  interactive?: boolean;
}

const paddingMap = {
  none: '0',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
};

export const Card = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg}; /* Google 12px Card Radius */
  padding: ${({ padding = 'md' }) => paddingMap[padding]};
  transition: ${({ theme }) => theme.transitions.fast};
  box-shadow: none;

  ${({ border = true, theme }) =>
    border &&
    css`
      border: 1px solid ${theme.colors.border};
    `}

  ${({ interactive, theme }) =>
    interactive &&
    css`
      cursor: pointer;
      &:hover {
        border-color: ${theme.colors.primary};
        background-color: ${theme.colors.primary}08;
      }
    `}

  /* Google Flat container: Clean, sharp solid surface without blur */
  ${({ glass, theme }) =>
    glass &&
    css`
      background-color: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border};
    `}
`;
