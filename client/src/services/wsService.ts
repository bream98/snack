import { toast } from '../components/common/Toast';
import {useChatStore} from "../store/useChatStore.tsx";

export interface WSMessage<T = any> {
  trace_id?: string;
  action: string;
  payload: T;
}

export type MessageHandler = (data: WSMessage) => void;
export type OpenHandler = (event: Event) => void;
export type ErrorHandler = (event: Event) => void;
export type CloseHandler = (event: CloseEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnecting = false;

  private messageHandlers: Set<MessageHandler> = new Set();
  private openHandlers: Set<OpenHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private closeHandlers: Set<CloseHandler> = new Set();

  public connect(token: string) {
    if (this.ws || this.isConnecting) return;
    if (!token) return;

    this.isConnecting = true;

    try {
      // Kết nối qua Proxy Nginx port 80 với Subprotocol ['access_token', token]
      const ws = new WebSocket('ws://localhost/ws', ['access_token', token]);

      ws.onopen = (event: Event) => {
        this.ws = ws;
        this.isConnecting = false;
        console.log('[WS] Connected to WebSocket server');

        // Báo cho tất cả subscriber đăng ký onopen
        this.openHandlers.forEach((handler) => handler(event));
      };

      ws.onmessage = (event: MessageEvent) => {
        this.handleIncomingMessage(event.data);
      };

      ws.onerror = (event: Event) => {
        console.error('[WS] 🔴 WebSocket Error:', event);
        this.isConnecting = false;

        // Báo cho tất cả subscriber đăng ký error
        this.errorHandlers.forEach((handler) => handler(event));
      };

      ws.onclose = (event: CloseEvent) => {
        console.log('[WS] ⚪ WebSocket Closed');
        this.ws = null;
        this.isConnecting = false;

        // Báo cho tất cả subscriber đăng ký close
        this.closeHandlers.forEach((handler) => handler(event));
      };
    } catch (err) {
      console.error('[WS] Lỗi khi tạo WebSocket:', err);
      this.isConnecting = false;
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
  }

  public send(action: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSMessage = {
      trace_id: Date.now().toString(),
      action,
      payload,
    };

    this.ws.send(JSON.stringify(message));
  }

  public subscribe(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }


  public onOpen(handler: OpenHandler) {
    this.openHandlers.add(handler);
    return () => {
      this.openHandlers.delete(handler);
    };
  }

  public onError(handler: ErrorHandler) {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  public onClose(handler: CloseHandler) {
    this.closeHandlers.add(handler);
    return () => {
      this.closeHandlers.delete(handler);
    };
  }

  private handleIncomingMessage(rawData: string) {
    try {
      const data: WSMessage = JSON.parse(rawData);

      this.messageHandlers.forEach((handler) => handler(data));

      switch (data.action) {
        case 'ws_error':
          toast.error(data.payload?.msg || 'Lỗi kết nối từ server');
          break;

        case 'new_message_response':
          if (data.payload) {
            useChatStore
              .getState()
                .addMessage(data.payload);
          }
          break;

        default:
          break;
      }
    } catch (err) {       
      console.log('[WS] Nhận tin dạng chuỗi thuần:', rawData);
    }
  }
}

export const wsService = new WebSocketService();
