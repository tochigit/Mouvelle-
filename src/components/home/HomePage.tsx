'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroSection } from './HeroSection';
import { FeaturedCollections } from './FeaturedCollections';
import { TrendingProducts } from './TrendingProducts';
import { PromoBanner } from './PromoBanner';
import { NewArrivals } from './NewArrivals';
import { TrustBadges } from './TrustBadges';
import { SocialShowcase } from './SocialShowcase';
import { Newsletter } from './Newsletter';
import type { Product } from '@/lib/types';
import SetupRequired from '@/components/common/SetupRequired';

interface HomePageProps {
  products?: Product[];
}

function HomeLoadingSkeleton() {
  return (
    <div className="space-y-0">
      {/* Hero skeleton */}
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <Skeleton className="h-6 w-40 mx-auto rounded-full" />
          <Skeleton className="h-16 w-[500px] max-w-full mx-auto" />
          <Skeleton className="h-6 w-[400px] max-w-full mx-auto" />
          <div className="flex gap-4 justify-center pt-2">
            <Skeleton className="h-12 w-44 rounded-full" />
            <Skeleton className="h-12 w-52 rounded-full" />
          </div>
        </div>
      </div>

      {/* Collections skeleton */}
      <div className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-[2px] w-16 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Products skeleton */}
      <div className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-10">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ products: initialProducts }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts?.length);
  const [configRequired, setConfigRequired] = useState(false);

  useEffect(() => {
    if (initialProducts?.length) return;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=50');
        if (res.status === 503) {
          setConfigRequired(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [initialProducts]);

  if (loading) {
    return <HomeLoadingSkeleton />;
  }

  if (configRequired) {
    return (
      <main>
        <HeroSection />
        <SetupRequired compact />
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main>
        <HeroSection />
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              Private Catalogue
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
              New collections arriving soon.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              The storefront is connected to live inventory. Products will appear here as soon as the admin publishes them.
            </p>
          </div>
        </section>
        <TrustBadges />
        <Newsletter />
      </main>
    );
  }

  return (
    <main>
      <HeroSection />
      <FeaturedCollections products={products} />
      <TrendingProducts products={products} />
      <PromoBanner />
      <NewArrivals products={products} />
      <TrustBadges />
      <SocialShowcase />
      <Newsletter />
    </main>
  );
}
