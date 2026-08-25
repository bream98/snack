import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/sidebar/Sidebar.tsx';
import Topbar from '../../components/topbar/Topbar.tsx';

/* 3-Section Home Layout: Header (Top), Sidebar (Left), Dashboard (Main Content Outlet) */
const HomeLayoutGrid = styled.div`
  display: grid;
  grid-template-rows: 56px 1fr;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    'header header'
    'sidebar dashboard';
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.background};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'header'
      'dashboard';
  }
`;

const HeaderSection = styled.header`
  grid-area: header;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DashboardSection = styled.main`
  grid-area: dashboard;
  background-color: ${({ theme }) => theme.colors.surface};
  height: 100%;
  overflow: hidden;
`;

export function HomePage() {
  return (
    <HomeLayoutGrid>
      <HeaderSection>
        <Topbar />
      </HeaderSection>
      <Sidebar />
      <DashboardSection>
        <Outlet />
      </DashboardSection>
    </HomeLayoutGrid>
  );
}
