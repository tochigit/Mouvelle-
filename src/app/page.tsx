'use client';

import { useNavigationStore } from '@/stores/navigation';
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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default function Home() {
  const { currentPage } = useNavigationStore();

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
