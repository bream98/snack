import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
}

interface KanbanState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  deleteTask: (taskId: string) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: [
    {
      id: 'task-1',
      title: 'Thiết kế Design System Tokens',
      description: 'Định nghĩa bảng màu, typography và khoảng cách 4px grid.',
      status: 'done',
      priority: 'high',
      assignee: 'Nam Luong',
    },
    {
      id: 'task-2',
      title: 'Xây dựng Topbar & Sidebar Component',
      description: 'Phân chia khu vực Features (Profile, Activity, Settings) và Main (CM, DM).',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Nam Luong',
    },
    {
      id: 'task-3',
      title: 'Kết nối Router Mainboard',
      description: 'Xây dựng màn hình Mainboard điều hướng linh hoạt giữa CM, DM & Kanban.',
      status: 'todo',
      priority: 'medium',
      assignee: 'Nam Luong',
    },
    {
      id: 'task-4',
      title: 'Tích hợp Realtime Chat (CM/DM)',
      description: 'Kết nối WebSocket / Server events cho tin nhắn tức thì.',
      status: 'backlog',
      priority: 'low',
      assignee: 'Team Dev',
    },
  ],
  addTask: (newTask) =>
    set((state) => ({
      tasks: [...state.tasks, { ...newTask, id: `task-${Date.now()}` }],
    })),
  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
}));
