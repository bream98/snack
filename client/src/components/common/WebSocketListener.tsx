import { useEffect, useState, useRef, type ReactNode } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../../store/useAuthStore';
import { wsService } from '../../services/wsService';

interface WebSocketListenerProps {
  children?: ReactNode;
}

export function WebSocketListener({ children }: WebSocketListenerProps) {
  const { isAuthenticated, token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnectionStopped, setIsConnectionStopped] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxRetries = 5;
  const baseDelayMs = 1500;

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnected(false);
      setIsConnectionStopped(false);
      setRetryCount(0);
      clearRetryTimer();
      wsService.disconnect();
      return;
    }

    const unsubOpen = wsService.onOpen(() => {
      setIsConnected(true);
      setIsConnectionStopped(false);
      setRetryCount(0);
      clearRetryTimer();
    });

    const handleConnectionLoss = () => {
      setIsConnected(false);

      if (retryTimerRef.current) return;

      setRetryCount((prevCount) => {
        const nextCount = prevCount + 1;

        if (nextCount > maxRetries) {
          setIsConnectionStopped(true);
          clearRetryTimer();
          return prevCount;
        }

        const delay = baseDelayMs * Math.pow(2, prevCount);

        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          wsService.disconnect();
          wsService.connect(token);
        }, delay);

        return nextCount;
      });
    };

    const unsubClose = wsService.onClose(handleConnectionLoss);
    const unsubError = wsService.onError(handleConnectionLoss);

    // Khởi tạo kết nối ban đầu
    wsService.connect(token);

    return () => {
      unsubOpen();
      unsubClose();
      unsubError();
      clearRetryTimer();
      wsService.disconnect();
    };
  }, [isAuthenticated, token]);

  const handleManualRetry = () => {
    if (!token) return;
    setIsConnectionStopped(false);
    setRetryCount(0);
    clearRetryTimer();
    wsService.disconnect();
    wsService.connect(token);
  };

  if (isConnectionStopped && !isConnected) {
    return (
      <ConnectionStatusOverlay>
        <StatusCard>
          <StatusTitle>Disconnected</StatusTitle>
          <RetryButton onClick={handleManualRetry}>Try reconnect</RetryButton>
        </StatusCard>
      </ConnectionStatusOverlay>
    );
  }

  if (!isConnected && isAuthenticated && token) {
    return (
      <LoadingWaitConnection>
        <StatusText>
          {retryCount > 0
            ? 'Reconnecting...'
            : 'Connecting...'}
        </StatusText>
      </LoadingWaitConnection>
    );
  }

  return <>{children}</>;
}

const LoadingWaitConnection = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const StatusText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#202124'};
`;

const ConnectionStatusOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const StatusCard = styled.div`
  background-color: #ffffff;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 380px;
`;

const StatusTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #d93025;
`;


const RetryButton = styled.button`
  background-color: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
`;
