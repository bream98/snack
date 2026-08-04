import { create } from 'zustand';

export type MainboardRoute =
  | 'cm'
  | 'dm'
  | 'profile'
  | 'activity'
  | 'settings';

interface NavigationState {
  activeRoute: MainboardRoute;
  selectedId: string;
  isSidebarOpen: boolean;
  navigate: (route: MainboardRoute, selectedId?: string) => void;
  toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeRoute: 'cm',
  selectedId: 'general',
  isSidebarOpen: true,
  navigate: (route, selectedId = 'general') =>
    set({
      activeRoute: route,
      selectedId,
      // Auto close sidebar on mobile after navigating
      ...(window.innerWidth <= 768 ? { isSidebarOpen: false } : {}),
    }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
