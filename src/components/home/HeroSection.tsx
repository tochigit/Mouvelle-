'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation';
import { BRAND_NAME } from '@/lib/constants';

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigationStore((s) => s.navigate);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        {/* Hero image background */}
        <Image
          src="/images/hero-perfume.png"
          alt="Luxury fragrance collection"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/90 via-[#0D0D0D]/70 to-[#0D0D0D]/80" />
        {/* Bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
        {/* Subtle gold accent glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/[0.03] blur-[120px]" />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]/50" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        >
          {/* Label */}
          <motion.div variants={itemVariants}>
            <span className="inline-block text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase border border-[#D4AF37]/30 px-4 py-1.5 rounded-full">
              Curated Luxury
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.1] tracking-tight"
          >
            Discover the Art of
            <br />
            <span className="text-[#D4AF37]">Modern Elegance</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Premium perfumes, sunglasses, jewelry &amp; accessories crafted for the discerning Nigerian
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <Button
              size="lg"
              className="bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030] font-medium text-sm tracking-wide px-8 h-12 rounded-full"
              onClick={() => navigate('shop')}
            >
              Shop Collection
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37] font-medium text-sm tracking-wide px-8 h-12 rounded-full bg-transparent"
              onClick={() => navigate('collections')}
            >
              Explore Collections
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-light">Scroll</span>
          <ChevronDown className="size-5 text-[#D4AF37]/60" />
        </motion.div>
      </motion.div>

      {/* Brand watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-12 right-8 z-[1] hidden lg:block"
      >
        <span className="font-serif text-8xl text-[#D4AF37] font-bold select-none">
          {BRAND_NAME}
        </span>
      </motion.div>
    </section>
  );
}
