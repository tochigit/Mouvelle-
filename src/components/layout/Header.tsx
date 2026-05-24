'use client';

import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, Sun, Moon, User, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { BRAND_NAME, CATEGORIES } from '@/lib/constants';
import { useHydrated } from '@/hooks/useHydrated';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NAV_LINKS = [
  { label: 'Shop', page: 'shop' as const },
  { label: 'Collections', page: 'shop' as const },
  { label: 'About', page: 'home' as const },
  { label: 'Contact', page: 'home' as const },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hydrated = useHydrated();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigationStore((s) => s.navigate);
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistItems = useWishlistStore((s) => s.items);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: Parameters<typeof navigate>[0]) => {
    navigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
            : 'bg-background'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile: Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Desktop: Nav Links Left */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.page)}
                  className="text-xs uppercase tracking-[0.2em] font-medium text-foreground hover:text-[#D4AF37] transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Center: Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
            >
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#D4AF37] tracking-[0.15em] uppercase">
                {BRAND_NAME}
              </h1>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                aria-label="Search"
              >
                <Search className="size-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('wishlist')}
                className="relative"
                aria-label="Wishlist"
              >
                <Heart className="size-5" />
                {hydrated && wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold rounded-full size-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('cart')}
                className="relative"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="size-5" />
                {hydrated && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold rounded-full size-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 bg-background p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="font-serif text-2xl font-bold text-[#D4AF37] tracking-[0.15em] uppercase text-left">
              {BRAND_NAME}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="px-6 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.page)}
                  className="flex items-center justify-between w-full py-3 text-sm uppercase tracking-[0.15em] font-medium text-foreground hover:text-[#D4AF37] transition-colors"
                >
                  {link.label}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </nav>

            <Separator className="mx-6" />

            {/* Categories */}
            <div className="px-6 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-3">
                Categories
              </p>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    useNavigationStore.getState().setCategory(category);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full py-2.5 text-sm text-foreground hover:text-[#D4AF37] transition-colors"
                >
                  {category}
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>

            <Separator className="mx-6" />

            {/* Theme Toggle */}
            <div className="px-6 py-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-3 w-full py-2.5 text-sm text-foreground hover:text-[#D4AF37] transition-colors"
              >
                {hydrated && theme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
                <span className="uppercase tracking-[0.1em] text-xs font-medium">
                  {hydrated && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>

            <Separator className="mx-6" />

            {/* Account */}
            <div className="px-6 py-4">
              <button
                onClick={() => {
                  handleNavClick('account');
                }}
                className="flex items-center gap-3 w-full py-2.5 text-sm text-foreground hover:text-[#D4AF37] transition-colors"
              >
                <User className="size-4" />
                <span className="uppercase tracking-[0.1em] text-xs font-medium">
                  Account
                </span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
