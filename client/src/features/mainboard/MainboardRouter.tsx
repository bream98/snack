import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card } from '../../design-system';
import { CMScreen } from './CMScreen';
import { DMScreen } from './DMScreen';
import { ProfileScreen } from './ProfileScreen';
import { SettingsScreen } from './FeatureScreens';

const MainboardTile = styled(Card)`
  height: 100%;
  padding: 1.25rem;
  overflow-y: auto;
`;

export function MainboardRouter() {
  return (
    <MainboardTile glass>
      <Routes>
        <Route index element={<Navigate to="cm/general" replace />} />
        <Route path="cm/:channelId" element={<CMScreen />} />
        <Route path="dm/:userId" element={<DMScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="cm/general" replace />} />
      </Routes>
    </MainboardTile>
  );
}
