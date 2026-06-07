import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string | null, size: string | null) => void;
  updateQuantity: (productId: string, color: string | null, size: string | null, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addItem: (item) => set((state) => {
        const existing = state.items.find(
          (i) => i.productId === item.productId && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize
        );
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stockQuantity) }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId, color, size) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.selectedColor === color && i.selectedSize === size)
        ),
      })),

      updateQuantity: (productId, color, size, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId && i.selectedColor === color && i.selectedSize === size
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity)) }
            : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'mouvelle-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
