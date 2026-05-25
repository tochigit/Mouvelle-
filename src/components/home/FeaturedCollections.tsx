'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation';
import { CATEGORIES } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface FeaturedCollectionsProps {
  products: Product[];
}

const categoryGradients: Record<string, string> = {
  Perfumes: 'from-amber-950/80 via-[#1A1A1A] to-yellow-950/60',
  Sunglasses: 'from-slate-900/80 via-[#1A1A1A] to-zinc-900/60',
  Jewelry: 'from-yellow-950/80 via-[#1A1A1A] to-amber-950/60',
  'Fashion Accessories': 'from-stone-900/80 via-[#1A1A1A] to-neutral-900/60',
};

const categoryIcons: Record<string, string> = {
  Perfumes: '✨',
  Sunglasses: '🕶️',
  Jewelry: '💎',
  'Fashion Accessories': '👜',
};

export function FeaturedCollections({ products }: FeaturedCollectionsProps) {
  const setCategory = useNavigationStore((s) => s.setCategory);

  const getCategoryCount = (category: string) =>
    products.filter((p) => p.category === category).length;

  const getCategoryImage = (category: string) => {
    const catProduct = products.find((p) => p.category === category);
    return catProduct?.images?.[0]?.imageUrl || null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground"
          >
            Shop by Collection
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-[2px] bg-[#D4AF37] mx-auto mt-4"
          />
        </div>

        {/* Collections Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {CATEGORIES.map((category) => {
            const count = getCategoryCount(category);
            const image = getCategoryImage(category);

            return (
              <motion.div
                key={category}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => setCategory(category)}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  {/* Background */}
                  {image ? (
                    <Image
                      src={image}
                      alt={category}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : null}
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      categoryGradients[category] || 'from-black/80 via-black/60 to-black/40'
                    }`}
                  />
                  {/* Always show a gradient base layer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] -z-10" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 transition-transform duration-500 group-hover:-translate-y-1">
                    <span className="text-3xl mb-3">{categoryIcons[category]}</span>
                    <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-white font-medium text-center">
                      {category}
                    </h3>
                    <p className="text-[#D4AF37] text-xs md:text-sm mt-1.5 font-medium">
                      {count} Product{count !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-white/0 group-hover:text-white/80 transition-all duration-300 text-xs">
                      <span>Explore</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>

                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-xl border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/30 transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
