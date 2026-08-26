import { create } from 'zustand';
import { apiClient } from '../services/apiClient.ts';

export interface UserDB {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  display_name: string;
  phone: string;
}

export interface DirectChannelDB {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
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


interface ChatState {
  channels: DirectChannelDB[];
  users: UserDB[];
  channelData: Record<number, { unreadCount: number }>;
  messages: Record<
    number,
    {
      messageIds: number[];
      messageMap: Record<number, DirectMessageDB>;
    }
  >;
  fetchDirectChannels: () => Promise<void>;
  fetchHistoricalMessages: (channelId: number, fromMsgId?: number) => Promise<void>;
  addMessage: (message: DirectMessageDB) => void;
  addChannel: (channel: DirectChannelDB) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channels: [],
    users: [],
  channelData: {},
  messages: {},

  fetchDirectChannels: async () => {
    try {
      const channelList = await apiClient<DirectChannelDB[]>('/direct-chat');
      set({ channels: Array.isArray(channelList) ? channelList : [] });
    } catch (err) {
      console.error('error', err);
    }
  },

  fetchHistoricalMessages: async (channelId: number, fromMsgId?: number) => {
    try {
      const url = fromMsgId
        ? `/direct-chat/messages/${channelId}?from_msg_id=${fromMsgId}`
        : `/direct-chat/messages/${channelId}`;

      const msgList = await apiClient<DirectMessageDB[]>(url);

      set((state) => {
        const channelMsgState = state.messages[channelId] || {
          messageIds: [],
          messageMap: {},
        };

        const newMap = { ...channelMsgState.messageMap };
        const newIdsSet = new Set(channelMsgState.messageIds);

        msgList.forEach((msg) => {
          newMap[msg.ID] = msg;
          newIdsSet.add(msg.ID);
        });

        const sortedIds = Array.from(newIdsSet).sort((a, b) => b - a);

        return {
          messages: {
            ...state.messages,
            [channelId]: {
              messageIds: sortedIds,
              messageMap: newMap,
            },
          },
        };
      });
    } catch (err) {
      console.error(`error at channel ${channelId}`, err);
    }
  },

  addMessage: (message: DirectMessageDB) => {
    set((state) => {
      const channelId = message.channel_id;
      const channelMsgState = state.messages[channelId] || {
        messageIds: [],
        messageMap: {},
      };

      const updatedIds = channelMsgState.messageIds.includes(message.ID)
        ? channelMsgState.messageIds
        : [message.ID, ...channelMsgState.messageIds];

      const updatedMap = {
        ...channelMsgState.messageMap,
        [message.ID]: message,
      };

      const isChannelExist = state.channels.some((ch) => ch.ID === channelId);
      const updatedChannels = isChannelExist
        ? state.channels
        : [
            {
              ID: channelId,
              user_id_1: 0,
              user_id_2: message.user_id,
              user_2: message.user,
            },
            ...state.channels,
          ];

      return {
        channels: updatedChannels,
        messages: {
          ...state.messages,
          [channelId]: {
            messageIds: updatedIds,
            messageMap: updatedMap,
          },
        },
      };
    });
  },

  addChannel: (channel: DirectChannelDB) => {
    set((state) => {
      const isExist = state.channels.some((ch) => ch.ID === channel.ID);
      if (isExist) return state;
      return { channels: [...state.channels, channel] };
    });
  },
}));