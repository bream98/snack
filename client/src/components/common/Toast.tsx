import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

/* 1-Line Global Call Utility */
export const toast = {
  success: (message: string, duration = 3000) => {
    emit({ id: Math.random().toString(), message, type: 'success', duration });
  },
  error: (message: string, duration = 3000) => {
    emit({ id: Math.random().toString(), message, type: 'error', duration });
  },
  info: (message: string, duration = 3000) => {
    emit({ id: Math.random().toString(), message, type: 'info', duration });
  },
};

function emit(toastItem: ToastItem) {
  listeners.forEach((listener) => listener(toastItem));
}

const FloatingWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
`;

const ToastBanner = styled.div<{ $type: ToastType }>`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  background-color: ${({ $type, theme }) => {
    switch ($type) {
      case 'error':
        return theme.colors.danger;
      case 'success':
        return theme.colors.success;
      case 'info':
      default:
        return theme.colors.primary;
    }
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 2px;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

/* Single Root Toast Component mounted once in App.tsx */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNewToast: ToastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <FloatingWrapper>
      {toasts.map((t) => (
        <ToastBanner key={t.id} $type={t.type}>
          <span>
            {t.type === 'error' ? '⚠️' : t.type === 'success' ? '✅' : 'ℹ️'} {t.message}
          </span>
          <CloseBtn
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
          >
            ✕
          </CloseBtn>
        </ToastBanner>
      ))}
    </FloatingWrapper>,
    document.body
  );
}
