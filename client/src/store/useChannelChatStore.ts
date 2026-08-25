import { create } from 'zustand';
import { apiClient } from '../services/apiClient';
import type { UserDB } from './useDirectChatStore';

export interface ChannelDB {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  name: string;
}

export interface ChannelMetadata {
  unreadCount?: number;
}

export interface ChannelItem {
  channel: ChannelDB;
  metadata?: ChannelMetadata;
}

interface ChannelChatState {
  channels: ChannelItem[];
  membersByChannel: Record<number, UserDB[]>;
  activeChannelId: number | null;
  isLoadingChannels: boolean;
  isLoadingMembers: boolean;
  error: string | null;

  setActiveChannelId: (channelId: number | null) => void;
  fetchChannels: () => Promise<void>;
  createChannel: (name: string) => Promise<ChannelDB | null>;
  deleteChannel: (channelId: number) => Promise<void>;
  fetchChannelMembers: (channelId: number) => Promise<void>;
  addChannelMember: (channelId: number, userId: number) => Promise<void>;
  removeChannelMember: (channelId: number, userId: number) => Promise<void>;
  clearError: () => void;
}

export const useChannelChatStore = create<ChannelChatState>((set, get) => ({
  channels: [],
  membersByChannel: {},
  activeChannelId: null,
  isLoadingChannels: false,
  isLoadingMembers: false,
  error: null,

  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  clearError: () => set({ error: null }),

  /* Lấy danh sách kênh mà người dùng tham gia (GET /channels) */
  fetchChannels: async () => {
    set({ isLoadingChannels: true, error: null });
    try {
      const rawChannels = await apiClient<ChannelDB[]>('/channels', {
        method: 'GET',
      });

      const channelItems: ChannelItem[] = (rawChannels || []).map((ch) => ({
        channel: ch,
        metadata: { unreadCount: 0 },
      }));

      set({ channels: channelItems, isLoadingChannels: false });
    } catch (err: any) {
      set({
        isLoadingChannels: false,
        error: err.message || 'Không thể lấy danh sách nhóm chat',
      });
    }
  },

  /* Tạo kênh mới (POST /channels) */
  createChannel: async (name: string) => {
    set({ error: null });
    try {
      const newChannel = await apiClient<ChannelDB>('/channels', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      const newItem: ChannelItem = {
        channel: newChannel,
        metadata: { unreadCount: 0 },
      };

      set((state) => ({
        channels: [newItem, ...state.channels],
      }));

      return newChannel;
    } catch (err: any) {
      set({ error: err.message || 'Không thể tạo nhóm chat' });
      return null;
    }
  },

  /* Xóa kênh (DELETE /channels/:channelId) */
  deleteChannel: async (channelId: number) => {
    set({ error: null });
    try {
      await apiClient(`/channels/${channelId}`, {
        method: 'DELETE',
      });

      set((state) => ({
        channels: state.channels.filter((item) => item.channel.ID !== channelId),
        activeChannelId:
          state.activeChannelId === channelId ? null : state.activeChannelId,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Không thể xóa kênh' });
    }
  },

  /* Lấy danh sách thành viên trong kênh (GET /channels/:channelId/members) */
  fetchChannelMembers: async (channelId: number) => {
    set({ isLoadingMembers: true, error: null });
    try {
      const members = await apiClient<UserDB[]>(`/channels/${channelId}/members`, {
        method: 'GET',
      });

      set((state) => ({
        membersByChannel: {
          ...state.membersByChannel,
          [channelId]: members || [],
        },
        isLoadingMembers: false,
      }));
    } catch (err: any) {
      set({
        isLoadingMembers: false,
        error: err.message || 'Không thể lấy danh sách thành viên kênh',
      });
    }
  },

  /* Thêm thành viên vào kênh (POST /channels/:channelId/members) */
  addChannelMember: async (channelId: number, userId: number) => {
    set({ error: null });
    try {
      await apiClient(`/channels/${channelId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });

      await get().fetchChannelMembers(channelId);
    } catch (err: any) {
      set({ error: err.message || 'Không thể thêm thành viên vào kênh' });
    }
  },

  /* Xóa thành viên khỏi kênh (DELETE /channels/:channelId/members/:targetUserId) */
  removeChannelMember: async (channelId: number, userId: number) => {
    set({ error: null });
    try {
      await apiClient(`/channels/${channelId}/members/${userId}`, {
        method: 'DELETE',
      });

      set((state) => ({
        membersByChannel: {
          ...state.membersByChannel,
          [channelId]: (state.membersByChannel[channelId] || []).filter(
            (u) => u.ID !== userId
          ),
        },
      }));
    } catch (err: any) {
      set({ error: err.message || 'Không thể xóa thành viên khỏi kênh' });
    }
  },
}));
