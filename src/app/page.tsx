'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigation';
import { useOrderStore } from '@/stores/order';
import { useCartStore } from '@/stores/cart';
import { AnimatePresence, motion } from 'framer-motion';
import { HomePage } from '@/components/home/HomePage';
import ShopPage from '@/components/shop/ShopPage';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import CartPage from '@/components/cart/CartPage';
import CartSidebar from '@/components/cart/CartSidebar';
import CheckoutPage from '@/components/checkout/CheckoutPage';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import WishlistPage from '@/components/wishlist/WishlistPage';
import AccountPage from '@/components/account/AccountPage';
import CollectionsPage from '@/components/collections/CollectionsPage';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default function Home() {
  const { currentPage, navigate } = useNavigationStore();
  const { setLastOrder } = useOrderStore();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    let cancelled = false;
    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment verification failed');
        if (cancelled) return;
        setLastOrder(data.order.id, data.order.orderNumber, data.order.shippingState);
        clearCart();
        window.history.replaceState({}, '', window.location.pathname);
        navigate('checkout-success');
      } catch {
        window.history.replaceState({}, '', window.location.pathname);
        navigate('account');
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [clearCart, navigate, setLastOrder]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'collections':
        return <CollectionsPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'checkout-success':
        return <OrderConfirmation />;
      case 'wishlist':
        return <WishlistPage />;
      case 'account':
        return <AccountPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
      <CartSidebar />
      <WhatsAppButton />
      <MobileNav />
    </div>
  );
}
