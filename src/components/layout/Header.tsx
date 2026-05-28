'use client';

import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, Sun, Moon, User, ChevronRight, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { BRAND_NAME, CATEGORIES, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';
import { useHydrated } from '@/hooks/useHydrated';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import SearchOverlay from './SearchOverlay';

const NAV_LINKS: { label: string; page: string }[] = [
  { label: 'Shop', page: 'shop' },
  { label: 'Collections', page: 'collections' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (page: string) => {
    if (page === 'contact') {
      // Contact opens WhatsApp instead of navigating to a page
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, '_blank');
    } else if (page === 'about') {
      // About opens a dialog
      setIsAboutOpen(true);
    } else {
      navigate(page as Parameters<typeof navigate>[0]);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSearchOpenChange = (open: boolean) => {
    setIsSearchOpen(open);
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
                onClick={() => setIsSearchOpen(true)}
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

      {/* Search Overlay */}
      <SearchOverlay open={isSearchOpen} onOpenChange={handleSearchOpenChange} />

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 bg-background p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="font-serif text-2xl font-bold text-[#D4AF37] tracking-[0.15em] uppercase text-left">
              {BRAND_NAME}
            </SheetTitle>
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
            {/* Search in Mobile Menu */}
            <div className="px-6 py-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex items-center gap-3 w-full py-2.5 text-sm text-foreground hover:text-[#D4AF37] transition-colors"
              >
                <Search className="size-4" />
                <span className="uppercase tracking-[0.1em] text-xs font-medium">
                  Search
                </span>
              </button>
            </div>

            <Separator className="mx-6" />

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

      {/* About Dialog */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#D4AF37]">
              About {BRAND_NAME}
            </DialogTitle>
            <DialogDescription>
              Who we are and what we stand for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              {BRAND_NAME} is Nigeria&apos;s premier online destination for curated luxury accessories. Founded with a passion for making premium fashion accessible, we bring together the finest perfumes, sunglasses, jewelry, and accessories from around the world.
            </p>
            <p>
              Our mission is simple: to help every Nigerian express their unique style through carefully selected, authentic luxury products — delivered with care and excellence.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setIsAboutOpen(false);
                  navigate('shop');
                }}
                className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold"
              >
                Explore Our Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
