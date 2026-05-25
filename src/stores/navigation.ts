import { create } from 'zustand';
import type { PageView } from '@/lib/types';

interface NavigationState {
  currentPage: PageView;
  selectedProductId: string | null;
  selectedCategory: string | null;
  searchQuery: string | null;
  navigate: (page: PageView, productId?: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedCategory: null,
  searchQuery: null,
  navigate: (page, productId = null) => set({ currentPage: page, selectedProductId: productId }),
  setCategory: (category) => set({ selectedCategory: category, currentPage: 'shop' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
