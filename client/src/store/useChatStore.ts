import { create } from 'zustand';

export interface Member {
  id: string;
  account_name: string;
  display_name: string;
  phone_number: string;
  status: 'on' | 'off';
  last_online_time?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  reactions: { emoji: string; count: number }[];
  branchReplies: Message[];
  unreadCount?: number;
  isEdited?: boolean;
  isRecalled?: boolean;
}

export interface Channel {
  id: string;
  name: string;
}

export type SubContentType = 'branch' | 'userProfile' | null;

interface ChatState {
  currentUser: Member;
  channels: Channel[];
  members: Member[];
  messages: Record<string, Message[]>;
  activeSubContent: { type: SubContentType; data?: any } | null;
  branchWidth: number;
  setBranchWidth: (width: number) => void;
  openBranch: (messageId: string) => void;
  openUserProfile: (user: Member) => void;
  closeSubContent: () => void;
  sendMessage: (targetId: string, text: string) => void;
  editMessage: (targetId: string, messageId: string, newText: string) => void;
  recallMessage: (targetId: string, messageId: string) => void;
  sendBranchReply: (targetId: string, messageId: string, text: string) => void;
  toggleReaction: (targetId: string, messageId: string, emoji: string) => void;
  updateCurrentUserProfile: (profile: Partial<Member>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: {
    id: 'usr-1',
    account_name: 'namluong.dev',
    display_name: 'Nam Luong',
    phone_number: '+84987654321',
    status: 'on',
    last_online_time: 'Just now',
  },
  channels: [
    { id: 'general', name: 'general' },
    { id: 'random', name: 'random' },
  ],
  members: [
    {
      id: 'usr-2',
      account_name: 'alex.j',
      display_name: 'Alex Johnson',
      phone_number: '+84912345678',
      status: 'on',
      last_online_time: 'Just now',
    },
    {
      id: 'usr-3',
      account_name: 'sarah.c',
      display_name: 'Sarah Connor',
      phone_number: '+84901122334',
      status: 'off',
      last_online_time: '20m ago',
    },
  ],
  activeSubContent: null,
  branchWidth: 320,
  setBranchWidth: (width) => set({ branchWidth: Math.max(260, Math.min(600, width)) }),
  openBranch: (messageId) => set({ activeSubContent: { type: 'branch', data: { messageId } } }),
  openUserProfile: (user) => set({ activeSubContent: { type: 'userProfile', data: { user } } }),
  closeSubContent: () => set({ activeSubContent: null }),
  messages: {
    general: [
      {
        id: 'msg-101',
        senderId: 'usr-2',
        senderName: 'Alex Johnson',
        text: 'Hello everyone! Let us discuss the new features here.',
        timestamp: '10:15 AM',
        unreadCount: 3,
        reactions: [
          { emoji: '👍', count: 3 },
          { emoji: '🔥', count: 2 },
        ],
        branchReplies: [
          {
            id: 'r-1',
            senderId: 'usr-3',
            senderName: 'Sarah Connor',
            text: 'Agreed! The new layout is very flexible.',
            timestamp: '10:16 AM',
            reactions: [],
            branchReplies: [],
          },
          {
            id: 'r-2',
            senderId: 'usr-1',
            senderName: 'Nam Luong',
            text: 'The Branch panel on the right is super convenient.',
            timestamp: '10:18 AM',
            reactions: [{ emoji: '❤️', count: 1 }],
            branchReplies: [],
          },
        ],
      },
      {
        id: 'msg-102',
        senderId: 'usr-3',
        senderName: 'Sarah Connor',
        text: 'Please check the design file when you have time.',
        timestamp: '10:30 AM',
        reactions: [{ emoji: '❤️', count: 1 }],
        branchReplies: [],
      },
    ],
  },
  sendMessage: (targetId, text) =>
    set((state) => {
      const list = state.messages[targetId] || [];
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: state.currentUser.id,
        senderName: state.currentUser.display_name,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
        branchReplies: [],
      };
      return {
        messages: {
          ...state.messages,
          [targetId]: [...list, newMsg],
        },
      };
    }),
  editMessage: (targetId, messageId, newText) =>
    set((state) => {
      const list = state.messages[targetId] || [];
      const updated = list.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, text: newText, isEdited: true };
        }
        const updatedBranch = msg.branchReplies.map((r) =>
          r.id === messageId ? { ...r, text: newText, isEdited: true } : r
        );
        return { ...msg, branchReplies: updatedBranch };
      });
      return {
        messages: {
          ...state.messages,
          [targetId]: updated,
        },
      };
    }),
  recallMessage: (targetId, messageId) =>
    set((state) => {
      const list = state.messages[targetId] || [];
      const updated = list.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, text: 'Message recalled', isRecalled: true, reactions: [] };
        }
        const updatedBranch = msg.branchReplies.map((r) =>
          r.id === messageId
            ? { ...r, text: 'Message recalled', isRecalled: true, reactions: [] }
            : r
        );
        return { ...msg, branchReplies: updatedBranch };
      });
      return {
        messages: {
          ...state.messages,
          [targetId]: updated,
        },
      };
    }),
  sendBranchReply: (targetId, messageId, text) =>
    set((state) => {
      const list = state.messages[targetId] || [];
      const updated = list.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            branchReplies: [
              ...msg.branchReplies,
              {
                id: `reply-${Date.now()}`,
                senderId: state.currentUser.id,
                senderName: state.currentUser.display_name,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reactions: [],
                branchReplies: [],
              },
            ],
          };
        }
        return msg;
      });
      return {
        messages: {
          ...state.messages,
          [targetId]: updated,
        },
      };
    }),
  toggleReaction: (targetId, messageId, emoji) =>
    set((state) => {
      const list = state.messages[targetId] || [];
      const toggle = (m: Message): Message => {
        if (m.id === messageId) {
          const existing = m.reactions.find((r) => r.emoji === emoji);
          let newReactions = [...m.reactions];
          if (existing) {
            newReactions = newReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            );
          } else {
            newReactions.push({ emoji, count: 1 });
          }
          return { ...m, reactions: newReactions };
        }
        return {
          ...m,
          branchReplies: m.branchReplies.map(toggle),
        };
      };

      return {
        messages: {
          ...state.messages,
          [targetId]: list.map(toggle),
        },
      };
    }),
  updateCurrentUserProfile: (profile) =>
    set((state) => ({
      currentUser: { ...state.currentUser, ...profile },
    })),
}));
