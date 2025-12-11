import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  currentUserId: string | null;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setUser: (userId: string | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false, // Default to light mode
      currentUserId: null,
      
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        applyTheme(newMode);
      },
      
      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        applyTheme(isDark);
      },
      
      setUser: (userId: string | null) => {
        const state = get();
        // Only update user, don't reset theme preference
        if (state.currentUserId !== userId) {
          set({ currentUserId: userId });
        }
      },
    }),
    {
      name: 'hearth-theme-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        currentUserId: state.currentUserId,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme when store is rehydrated
        if (state) {
          console.log('Theme rehydrated:', state.isDarkMode);
          applyTheme(state.isDarkMode);
        }
        return state;
      },
    }
  )
);

// Function to apply theme to the document
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('bg-dark', 'text-light');
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.body.classList.remove('bg-dark', 'text-light');
  }
};

// Initialize theme on app start and subscribe to changes
export const initializeTheme = () => {
  // Apply current theme immediately
  const store = useThemeStore.getState();
  applyTheme(store.isDarkMode);
  
  // Subscribe to theme changes to ensure theme is always applied
  useThemeStore.subscribe((state) => {
    console.log('Theme changed:', state.isDarkMode);
    applyTheme(state.isDarkMode);
  });
  
  // Also wait a bit for persistence to load and reapply
  setTimeout(() => {
    const rehydratedStore = useThemeStore.getState();
    console.log('Theme rehydrated after timeout:', rehydratedStore.isDarkMode);
    applyTheme(rehydratedStore.isDarkMode);
  }, 100);
};