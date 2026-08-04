import styled, { css } from 'styled-components';

export interface CardProps {
  glass?: boolean;
  interactive?: boolean;
  $glass?: boolean;
  $interactive?: boolean;
}

export const Card = styled.div.attrs<CardProps>((props) => ({
  $glass: props.$glass ?? props.glass ?? false,
  $interactive: props.$interactive ?? props.interactive ?? false,
}))<CardProps>`
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: none;

  ${({ $interactive, theme }) =>
    $interactive &&
    css`
      cursor: pointer;
      &:hover {
        border-color: ${theme.colors.primary};
      }
    `}
`;
