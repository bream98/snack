import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Test } from './features/test/Test';
import { ToastContainer } from './components/common/Toast';

export function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const { themeMode } = useAppStore();
  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <ToastContainer />
      <Routes>
        {/* Auth Routes */}
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
          path="/auth/register"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            ) : (
              <Navigate to="/app/cm/general" replace />
            )
          }
        />

        {/* Protected App Routes */}
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

        {/* Test Route */}
        <Route path="/test" element={<Test />} />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/app/cm/general' : '/auth/login'} replace />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
