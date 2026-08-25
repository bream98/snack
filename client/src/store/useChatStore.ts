import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export interface UserDB {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  display_name: string;
  phone: string;
}

export interface DirectChannelDB {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  user_id_1: number;
  user_1?: UserDB;
  user_id_2: number;
  user_2?: UserDB;
}

export interface DirectMessageDB {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  channel_id: number;
  user_id: number;
  user?: UserDB;
  value: string;
}

export interface DirectChannelMetadata {
  unreadCount?: number;
  lastMessage?: DirectMessageDB;
  isOnline?: boolean;
}

/* Item DirectChannel = Database Channel Object + Metadata */
export interface DirectChannelItem {
  channel: DirectChannelDB;
  metadata?: DirectChannelMetadata;
}

interface ChatState {
  /* directChannels: Item = Channel DB + Metadata */
  directChannels: DirectChannelItem[];
  /* directMessagesByChannel: Item = Database Message (DirectMessageDB) */
  directMessagesByChannel: Record<number, DirectMessageDB[]>;
  activeChannelId: number | null;
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  setActiveChannelId: (channelId: number | null) => void;
  fetchDirectChannels: () => Promise<void>;
  fetchDirectMessages: (channelId: number, fromMsgId?: number) => Promise<void>;
  appendDirectMessage: (channelId: number, dbMsg: DirectMessageDB) => void;
  updateChannelMetadata: (
    channelId: number,
    metadata: Partial<DirectChannelMetadata>
  ) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  directChannels: [],
  directMessagesByChannel: {},
  activeChannelId: null,
  isLoadingChannels: false,
  isLoadingMessages: false,
  error: null,

  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  clearError: () => set({ error: null }),

  /* Lấy danh sách Direct Channels từ API BE (GET /direct-chat) và đóng gói Channel DB + Metadata */
  fetchDirectChannels: async () => {
    set({ isLoadingChannels: true, error: null });
    try {
      const rawChannels = await apiClient<DirectChannelDB[]>('/direct-chat', {
        method: 'GET',
      });

      const channelItems: DirectChannelItem[] = rawChannels.map((ch) => ({
        channel: ch,
        metadata: {
          unreadCount: 0,
          isOnline: false,
        },
      }));

      set({ directChannels: channelItems, isLoadingChannels: false });
    } catch (err: any) {
      set({
        isLoadingChannels: false,
        error: err.message || 'Không thể lấy danh sách kênh chát 1-1',
      });
    }
  },

  /* Lấy danh sách Direct Messages từ API BE (GET /direct-chat/messages/:channelId) - Trả về mảng DirectMessageDB */
  fetchDirectMessages: async (channelId: number, fromMsgId?: number) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const queryStr = fromMsgId ? `?from_msg_id=${fromMsgId}` : '';
      const dbMessages = await apiClient<DirectMessageDB[]>(
        `/direct-chat/messages/${channelId}${queryStr}`,
        { method: 'GET' }
      );

      const existing = get().directMessagesByChannel[channelId] || [];
      const updatedList = fromMsgId ? [...dbMessages, ...existing] : dbMessages;

      set((state) => ({
        directMessagesByChannel: {
          ...state.directMessagesByChannel,
          [channelId]: updatedList,
        },
        isLoadingMessages: false,
      }));
    } catch (err: any) {
      set({
        isLoadingMessages: false,
        error: err.message || 'Không thể lấy danh sách tin nhắn',
      });
    }
  },

  /* Thêm trực tiếp Database Message vào channelId tương ứng */
  appendDirectMessage: (channelId, dbMsg) => {
    set((state) => {
      const currentList = state.directMessagesByChannel[channelId] || [];
      return {
        directMessagesByChannel: {
          ...state.directMessagesByChannel,
          [channelId]: [...currentList, dbMsg],
        },
      };
    });
  },

  /* Cập nhật metadata của DirectChannel (unreadCount, lastMessage, isOnline) */
  updateChannelMetadata: (channelId, metadata) => {
    set((state) => ({
      directChannels: state.directChannels.map((item) => {
        if (item.channel.ID === channelId) {
          return {
            ...item,
            metadata: {
              ...item.metadata,
              ...metadata,
            },
          };
        }
        return item;
      }),
    }));
  },
}));