import styled from 'styled-components';
import { MainboardRouter } from '../../features/mainboard/MainboardRouter';

const FullPageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export function DashboardLayout() {
  return (
    <FullPageContainer>
      <MainboardRouter />
    </FullPageContainer>
  );
}
