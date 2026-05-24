'use client';

import { Home, Grid3X3, ShoppingBag, Heart, User } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import type { PageView } from '@/lib/types';

interface TabItem {
  icon: React.ElementType;
  label: string;
  page: PageView;
  getBadge?: () => number;
}

export default function MobileNav() {
  const currentPage = useNavigationStore((s) => s.currentPage);
  const navigate = useNavigationStore((s) => s.navigate);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const tabs: TabItem[] = [
    { icon: Home, label: 'Home', page: 'home' },
    { icon: Grid3X3, label: 'Shop', page: 'shop' },
    {
      icon: ShoppingBag,
      label: 'Cart',
      page: 'cart',
      getBadge: () => cartCount,
    },
    {
      icon: Heart,
      label: 'Wishlist',
      page: 'wishlist',
      getBadge: () => wishlistCount,
    },
    { icon: User, label: 'Account', page: 'account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const badge = tab.getBadge?.() ?? 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors duration-200 ${
                isActive ? 'text-[#D4AF37]' : 'text-muted-foreground'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative">
                <Icon className="size-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-[#1A1A1A] text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
