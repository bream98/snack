import { ThemeProvider } from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { themeMode } = useAppStore();
  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Routes>
        <Route
          path="/auth/login"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            ) : (
              <Navigate to="/app/cm/general" replace />
            )
          }
        />

        <Route
          path="/app/*"
          element={
            isAuthenticated ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/app/cm/general" : "/auth/login"} replace />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
