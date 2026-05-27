'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { formatPriceWithDiscount } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Droplets,
  Gem,
  Moon,
  Sun,
  TrendingUp,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// Collection definitions
// ────────────────────────────────────────────────────────────────────
interface CollectionDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  bgMood: string; // subtle background color
  accentBorder: string; // border accent color class
  apiQueries: string[]; // query params for /api/products (multiple for combined collections)
  category?: string; // category to set on "View Collection"
  sort?: string; // sort param
}

const COLLECTIONS: CollectionDef[] = [
  {
    id: 'luxury-fragrance',
    title: 'Luxury Fragrance Collection',
    subtitle: 'Essence of Elegance',
    description:
      'Discover our curated selection of exquisite perfumes — each bottle a story of craftsmanship, rare ingredients, and timeless sophistication.',
    icon: <Droplets className="h-6 w-6" />,
    bgMood: 'bg-amber-950/[0.03]',
    accentBorder: 'border-amber-800/20',
    apiQueries: ['category=Perfumes&limit=10'],
    category: 'Perfumes',
  },
  {
    id: 'minimal-gold',
    title: 'Minimal Gold Accessories',
    subtitle: 'Understated Opulence',
    description:
      'Clean lines and warm gold tones define this collection of fine jewelry — pieces that whisper luxury without ever raising their voice.',
    icon: <Gem className="h-6 w-6" />,
    bgMood: 'bg-yellow-900/[0.03]',
    accentBorder: 'border-yellow-700/20',
    apiQueries: ['category=Jewelry&limit=10'],
    category: 'Jewelry',
  },
  {
    id: 'dark-essentials',
    title: 'Dark Essentials',
    subtitle: 'Shadow & Style',
    description:
      'Bold frames and moody accessories for those who dress with intention. Dark-toned pieces that command attention in any room.',
    icon: <Moon className="h-6 w-6" />,
    bgMood: 'bg-slate-950/[0.04]',
    accentBorder: 'border-slate-700/20',
    apiQueries: ['category=Sunglasses&limit=5', 'category=Fashion Accessories&limit=5'],
    category: 'Sunglasses',
  },
  {
    id: 'summer-drop',
    title: 'Summer Drop',
    subtitle: 'Fresh Season, Fresh Style',
    description:
      'The newest arrivals made for sun-soaked days and warm evenings. Embrace the season with pieces that radiate effortless cool.',
    icon: <Sun className="h-6 w-6" />,
    bgMood: 'bg-orange-950/[0.03]',
    accentBorder: 'border-orange-700/20',
    apiQueries: ['badge=NEW ARRIVAL&limit=10'],
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    subtitle: 'Loved by Many',
    description:
      'Our community\'s most-loved pieces — tried, tested, and treasured. These are the items that keep coming back into carts and wishlists.',
    icon: <TrendingUp className="h-6 w-6" />,
    bgMood: 'bg-emerald-950/[0.03]',
    accentBorder: 'border-emerald-700/20',
    apiQueries: ['sort=best-selling&limit=10'],
    sort: 'best-selling',
  },
];

// ────────────────────────────────────────────────────────────────────
// Editorial product card (simple: image + name + price)
// ────────────────────────────────────────────────────────────────────
function EditorialProductCard({ product }: { product: Product }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const images = product.images ?? [];
  const mainImage = images.find((img) => img.position === 0)?.imageUrl || images[0]?.imageUrl || '';
  const { current, original } = formatPriceWithDiscount(product.price, product.discountPrice);

  return (
    <motion.button
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px] text-left"
      onClick={() => navigate('product', product.id)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          unoptimized
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 bg-[#D4AF37] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md z-10">
            {product.badge}
          </span>
        )}
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <h3 className="font-serif text-sm md:text-base font-medium text-foreground truncate group-hover:text-[#D4AF37] transition-colors">
        {product.title}
      </h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-sm font-semibold text-[#D4AF37]">{current}</span>
        {original && (
          <span className="text-xs text-muted-foreground line-through">{original}</span>
        )}
      </div>
    </motion.button>
  );
}

// ────────────────────────────────────────────────────────────────────
// Loading skeleton for a collection row
// ────────────────────────────────────────────────────────────────────
function CollectionSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px]">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <Skeleton className="h-4 w-3/4 mt-3" />
          <Skeleton className="h-4 w-1/2 mt-1.5" />
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main CollectionsPage
// ────────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const { navigate, setCategory, goBack } = useNavigationStore();
  const [collectionData, setCollectionData] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Fetch products for each collection (supports multiple API queries merged into one collection)
  const fetchCollection = useCallback(async (col: CollectionDef) => {
    setLoading((prev) => ({ ...prev, [col.id]: true }));
    try {
      const results = await Promise.all(
        col.apiQueries.map(async (query) => {
          const res = await fetch(`/api/products?${query}`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.products ?? []) as Product[];
        })
      );
      // Merge and deduplicate by product id
      const all = results.flat();
      const seen = new Set<string>();
      const deduped = all.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setCollectionData((prev) => ({ ...prev, [col.id]: deduped }));
    } catch {
      setCollectionData((prev) => ({ ...prev, [col.id]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [col.id]: false }));
    }
  }, []);

  useEffect(() => {
    COLLECTIONS.forEach((col) => fetchCollection(col));
  }, [fetchCollection]);

  // Handle "View Collection" click
  const handleViewCollection = (col: CollectionDef) => {
    if (col.category) {
      setCategory(col.category);
    } else {
      navigate('shop');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]" />
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center"
          >
            {/* Overline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#D4AF37] text-xs sm:text-sm uppercase tracking-[0.3em] font-medium mb-4"
            >
              ÈLARA Curates
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Curated
              <span className="text-[#D4AF37]"> Collections</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-5 md:mt-6 text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Every piece tells a story. Explore our thoughtfully curated
              collections — designed around mood, moment, and meaning.
            </motion.p>

            {/* Gold decorative line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-[1.5px] bg-[#D4AF37] mx-auto mt-8"
            />

            {/* Scroll hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-10 text-white/30 text-xs uppercase tracking-[0.2em]"
            >
              Scroll to explore
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb + Back */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate('home')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Collections</span>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="text-muted-foreground hover:text-[#D4AF37] gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        {/* ── Collection Sections ── */}
        <div className="space-y-16 md:space-y-24">
          {COLLECTIONS.map((col, colIndex) => {
            const products = collectionData[col.id] ?? [];
            const isLoading = loading[col.id] ?? true;

            return (
              <motion.section
                key={col.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.7,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: colIndex * 0.05,
                }}
                className={`relative rounded-2xl ${col.bgMood} border ${col.accentBorder} overflow-hidden`}
              >
                {/* Section inner padding */}
                <div className="p-6 sm:p-8 md:p-10 lg:p-12">
                  {/* ── Collection Header ── */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
                    <div className="space-y-2">
                      {/* Overline with icon */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-2 text-[#D4AF37]"
                      >
                        {col.icon}
                        <span className="text-xs uppercase tracking-[0.2em] font-medium">
                          {col.subtitle}
                        </span>
                      </motion.div>

                      {/* Title */}
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
                      >
                        {col.title}
                      </motion.h2>

                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed"
                      >
                        {col.description}
                      </motion.p>
                    </div>

                    {/* View Collection button */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="shrink-0"
                    >
                      <Button
                        onClick={() => handleViewCollection(col)}
                        variant="outline"
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-primary-foreground gap-2 font-medium uppercase tracking-wider text-xs"
                      >
                        View Collection
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* ── Horizontal Scrollable Product Row ── */}
                  {isLoading ? (
                    <CollectionSkeleton />
                  ) : products.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground text-sm">
                        No products in this collection yet.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-4 md:gap-5 pb-4">
                        {products.map((product, i) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.4,
                              delay: i * 0.06,
                              ease: 'easeOut',
                            }}
                          >
                            <EditorialProductCard product={product} />
                          </motion.div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="h-1.5" />
                    </ScrollArea>
                  )}

                  {/* Product count */}
                  {!isLoading && products.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 text-xs text-muted-foreground/60 uppercase tracking-wider"
                    >
                      {products.length} piece{products.length !== 1 ? 's' : ''} in this collection
                    </motion.p>
                  )}
                </div>

                {/* Gold accent line at bottom */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
              </motion.section>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 md:mt-28 text-center"
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Can&apos;t Decide?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-6">
            Browse our full catalogue and discover the piece that speaks to you.
          </p>
          <Button
            onClick={() => navigate('shop')}
            className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold gap-2 uppercase tracking-wider text-sm"
          >
            Shop All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
