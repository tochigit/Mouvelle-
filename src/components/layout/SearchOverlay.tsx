'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Loader2,
  PackageOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { formatPriceWithDiscount } from '@/lib/format';
import { CATEGORIES } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  category: string;
  images: { imageUrl: string; altText: string | null; position: number }[];
  badge: string | null;
}

const POPULAR_SEARCHES = ['Perfume', 'Sunglasses', 'Gold Necklace', 'Silk Scarf', 'Leather Bag'];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const containerVariants = {
  hidden: { opacity: 0, y: -40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

const resultVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.2 },
  }),
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigationStore((s) => s.navigate);
  const setSearchQuery = useNavigationStore((s) => s.setSearchQuery);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setSelectedIndex(-1);
      setIsLoading(false);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(-1);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectProduct = useCallback(
    (product: SearchResultItem) => {
      handleClose();
      navigate('product', product.id);
    },
    [handleClose, navigate]
  );

  const handleViewAll = useCallback(() => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate('shop');
      handleClose();
    }
  }, [query, setSearchQuery, navigate, handleClose]);

  const handlePopularSearch = useCallback((term: string) => {
    setQuery(term);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = results.length;
      // "View all results" button counts as an extra item
      const maxIndex = hasSearched && totalItems > 0 ? totalItems : totalItems - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < maxIndex ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : maxIndex
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleSelectProduct(results[selectedIndex]);
          } else if (selectedIndex === results.length && hasSearched && results.length > 0) {
            handleViewAll();
          } else if (query.trim().length >= 2) {
            handleViewAll();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [results, selectedIndex, hasSearched, handleSelectProduct, handleViewAll, handleClose, query]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const items = resultsContainerRef.current.querySelectorAll('[data-search-item]');
      const el = items[selectedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, handleClose, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Search Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="w-full max-w-2xl pointer-events-auto rounded-2xl bg-background border border-border/60 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 border-b border-border/50">
                <Search className="size-5 text-[#D4AF37] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for products, categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground outline-none"
                  aria-label="Search input"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="size-4 text-muted-foreground" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1 shrink-0 ml-1">
                  <kbd className="px-2 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
                    Esc
                  </kbd>
                </div>
              </div>

              {/* Results Area */}
              <div
                ref={resultsContainerRef}
                className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto overscroll-contain custom-scrollbar"
              >
                {/* Loading State */}
                {isLoading && (
                  <div className="px-4 sm:px-6 py-8 flex flex-col items-center gap-3">
                    <Loader2 className="size-6 text-[#D4AF37] animate-spin" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                )}

                {/* Search Results */}
                {!isLoading && hasSearched && results.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 sm:px-6 pb-2">
                      <p className="text-xs text-muted-foreground">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {results.map((product, i) => (
                        <SearchResultRow
                          key={product.id}
                          product={product}
                          index={i}
                          isSelected={selectedIndex === i}
                          onSelect={handleSelectProduct}
                          onHover={() => setSelectedIndex(i)}
                        />
                      ))}
                    </AnimatePresence>

                    {/* View All Results Button */}
                    {results.length > 0 && (
                      <motion.div
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        custom={results.length}
                        exit="exit"
                      >
                        <button
                          onClick={handleViewAll}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 text-sm font-medium transition-colors min-h-[44px] ${
                            selectedIndex === results.length
                              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'text-[#D4AF37] hover:bg-[#D4AF37]/5'
                          }`}
                          data-search-item
                          onMouseEnter={() => setSelectedIndex(results.length)}
                          onMouseLeave={() => setSelectedIndex(-1)}
                        >
                          View all results for &ldquo;{query}&rdquo;
                          <ArrowRight className="size-4" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* No Results State */}
                {!isLoading && hasSearched && results.length === 0 && (
                  <div className="px-4 sm:px-6 py-10 flex flex-col items-center gap-3 text-center">
                    <PackageOpen className="size-10 text-muted-foreground/50" />
                    <p className="text-base font-medium text-foreground">No products found</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try a different search or browse our shop.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery(null);
                        navigate('shop');
                        handleClose();
                      }}
                      className="mt-2 px-5 py-2.5 bg-[#D4AF37] text-[#1A1A1A] text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#C0A030] transition-colors min-h-[44px]"
                    >
                      Browse Shop
                    </button>
                  </div>
                )}

                {/* Initial State - Popular Searches */}
                {!isLoading && !hasSearched && query.length < 2 && (
                  <div className="px-4 sm:px-6 py-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="size-4 text-[#D4AF37]" />
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                        Popular Searches
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularSearch(term)}
                          className="px-3.5 py-2 rounded-full border border-border/60 text-sm text-foreground hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors min-h-[36px]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Search className="size-3.5 text-muted-foreground" />
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                        Browse Categories
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            useNavigationStore.getState().setCategory(category);
                            handleClose();
                          }}
                          className="flex items-center justify-between w-full py-2.5 text-sm text-foreground hover:text-[#D4AF37] transition-colors min-h-[44px]"
                        >
                          {category}
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Individual search result row
function SearchResultRow({
  product,
  index,
  isSelected,
  onSelect,
  onHover,
}: {
  product: SearchResultItem;
  index: number;
  isSelected: boolean;
  onSelect: (product: SearchResultItem) => void;
  onHover: () => void;
}) {
  const { current, original, discount } = formatPriceWithDiscount(
    product.price,
    product.discountPrice
  );

  const images = product.images ?? [];
  const mainImage =
    images.find((img) => img.position === 0)?.imageUrl || images[0]?.imageUrl || '';

  return (
    <motion.button
      variants={resultVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      exit="exit"
      onClick={() => onSelect(product)}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 transition-colors min-h-[44px] text-left ${
        isSelected ? 'bg-[#D4AF37]/8' : 'hover:bg-muted/50'
      }`}
      data-search-item
    >
      {/* Thumbnail */}
      <div className="relative size-12 sm:size-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.title}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center size-full">
            <PackageOpen className="size-5 text-muted-foreground/50" />
          </div>
        )}
        {discount && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full size-4 flex items-center justify-center leading-none">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {product.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold text-[#D4AF37]">{current}</span>
          {original && (
            <span className="text-[11px] text-muted-foreground line-through">
              {original}
            </span>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <span className="hidden sm:inline-flex shrink-0 px-2.5 py-1 rounded-full bg-muted text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
        {product.category}
      </span>
      <span className="sm:hidden shrink-0 text-[10px] text-muted-foreground">
        {product.category}
      </span>

      {/* Arrow */}
      <ArrowRight
        className={`size-4 shrink-0 transition-colors ${
          isSelected ? 'text-[#D4AF37]' : 'text-muted-foreground/40'
        }`}
      />
    </motion.button>
  );
}
