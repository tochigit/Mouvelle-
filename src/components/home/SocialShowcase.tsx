'use client';

import { motion } from 'framer-motion';
import { Instagram, Heart } from 'lucide-react';

const socialPosts = [
  {
    id: 1,
    likes: 234,
    gradient: 'from-amber-950 via-[#2A2A2A] to-[#1A1A1A]',
  },
  {
    id: 2,
    likes: 189,
    gradient: 'from-[#2A2A2A] via-yellow-950/50 to-[#1A1A1A]',
  },
  {
    id: 3,
    likes: 312,
    gradient: 'from-[#1A1A1A] via-amber-950/40 to-[#2A2A2A]',
  },
  {
    id: 4,
    likes: 276,
    gradient: 'from-stone-900 via-[#2A2A2A] to-yellow-950/30',
  },
];

export function SocialShowcase() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Instagram className="size-5 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
              Follow Us
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground"
          >
            @elara.ng
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-[2px] bg-[#D4AF37] mx-auto mt-4"
          />
        </div>

        {/* Social Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {socialPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
            >
              {/* Gradient background as placeholder image */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`}
              />

              {/* Subtle pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.5) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Decorative element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37]/[0.08] font-serif text-6xl md:text-8xl font-bold select-none">
                È
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center gap-2">
                  <Instagram className="size-7 text-white" />
                  <div className="flex items-center gap-1 text-white">
                    <Heart className="size-4 fill-white" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 md:mt-10"
        >
          <a
            href="https://instagram.com/elara.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300"
          >
            <Instagram className="size-4" />
            Follow Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
