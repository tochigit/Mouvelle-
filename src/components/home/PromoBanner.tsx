'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation';

export function PromoBanner() {
  const setCategory = useNavigationStore((s) => s.setCategory);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px] md:min-h-[480px]">
            {/* Left side - Image area */}
            <div className="relative lg:col-span-3 overflow-hidden">
              <Image
                src="/images/hero-collection.png"
                alt="Luxury fragrance collection"
                fill
                className="object-cover object-center"
                unoptimized
              />
              {/* Dark overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D]/80 lg:to-[#0D0D0D]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent lg:hidden" />
            </div>

            {/* Right side - Text area */}
            <div className="relative lg:col-span-2 bg-[#0D0D0D] p-8 md:p-12 lg:p-14 flex flex-col justify-center">
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent lg:top-0 lg:left-0 lg:w-[2px] lg:h-full lg:bg-gradient-to-b" />

              <div className="relative z-10 space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase">
                    Limited Edition
                  </span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight"
                >
                  The Art of
                  <br />
                  <span className="text-[#D4AF37]">Fragrance</span>
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-white/50 text-sm md:text-base leading-relaxed"
                >
                  Explore our curated collection of premium perfumes, designed for those who appreciate the finer things.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030] font-medium text-sm tracking-wide px-8 h-12 rounded-full mt-2"
                    onClick={() => setCategory('Perfumes')}
                  >
                    Explore Collection
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
