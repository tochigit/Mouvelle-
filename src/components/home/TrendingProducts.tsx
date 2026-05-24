'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useNavigationStore } from '@/stores/navigation';
import type { Product } from '@/lib/types';

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  const navigate = useNavigationStore((s) => s.navigate);

  const trendingProducts = products.filter((p) => p.featured).slice(0, 8);
  const displayProducts = trendingProducts.length > 0 ? trendingProducts : products.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase block mb-2">
              Handpicked for You
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              Trending Now
            </h2>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => navigate('shop')}
            className="group flex items-center gap-1.5 text-[#D4AF37] text-sm font-medium hover:gap-2.5 transition-all duration-300"
          >
            View All
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
