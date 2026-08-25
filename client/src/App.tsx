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
import { HomePage } from './features/home/HomePage';
import { NewChannelPage } from './features/channel/NewChannelPage';
import { ChannelMessagePage } from './features/message/ChannelMessagePage';
import { DirectMessagePage } from './features/message/DirectMessagePage';
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
          path="/login"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Home Route with Child Routes inside Dashboard Section */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/" replace />} />
          <Route path="channels/new" element={<NewChannelPage />} />
          <Route path="direct-message/:toId" element={<DirectMessagePage />} />
          <Route path="channel_message/:channelId" element={<ChannelMessagePage />} />
        </Route>

        {/* Test Route */}
        <Route path="/test" element={<Test />} />
        <Route path="/test/:toId" element={<Test />} />

        {/* Catch-all Redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
