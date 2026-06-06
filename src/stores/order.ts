import { create } from 'zustand';

interface OrderState {
  lastOrderId: string | null;
  lastOrderNumber: string | null;
  lastShippingState: string | null;
  setLastOrder: (orderId: string, orderNumber: string, shippingState?: string | null) => void;
  clearLastOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  lastOrderId: null,
  lastOrderNumber: null,
  lastShippingState: null,
  setLastOrder: (orderId, orderNumber, shippingState = null) =>
    set({ lastOrderId: orderId, lastOrderNumber: orderNumber, lastShippingState: shippingState }),
  clearLastOrder: () =>
    set({ lastOrderId: null, lastOrderNumber: null, lastShippingState: null }),
}));
