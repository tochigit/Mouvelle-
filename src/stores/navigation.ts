import { create } from 'zustand';
import type { PageView } from '@/lib/types';

interface NavigationEntry {
  page: PageView;
  productId: string | null;
}

interface NavigationState {
  currentPage: PageView;
  selectedProductId: string | null;
  selectedCategory: string | null;
  searchQuery: string | null;
  history: NavigationEntry[];
  canGoBack: () => boolean;
  goBack: () => void;
  navigate: (page: PageView, productId?: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string | null) => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedCategory: null,
  searchQuery: null,
  history: [],

  canGoBack: () => get().history.length > 1,

  goBack: () => {
    const { history } = get();
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      set({
        history: newHistory,
        currentPage: previous.page,
        selectedProductId: previous.productId,
      });
    }
  },

  navigate: (page, productId = null) => {
    const { history, currentPage, selectedProductId } = get();
    // Don't add duplicate entries
    const newEntry: NavigationEntry = { page, productId };
    const lastEntry = history[history.length - 1];
    if (lastEntry && lastEntry.page === page && lastEntry.productId === productId) {
      return;
    }
    set({
      currentPage: page,
      selectedProductId: productId,
      history: [...history, newEntry],
    });
  },

  setCategory: (category) => {
    const { history } = get();
    const newEntry: NavigationEntry = { page: 'shop', productId: null };
    set({
      selectedCategory: category,
      currentPage: 'shop',
      history: [...history, newEntry],
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
