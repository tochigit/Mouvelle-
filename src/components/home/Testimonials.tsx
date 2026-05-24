'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'The quality is absolutely stunning. My Noir Éclat perfume lasts all day and the packaging is pure luxury.',
    name: 'Chioma O.',
    location: 'Lagos',
  },
  {
    quote:
      'Best online shopping experience I\'ve had. The delivery was fast and the sunglasses are gorgeous.',
    name: 'Ade B.',
    location: 'Abuja',
  },
  {
    quote:
      'ÈLARA has become my go-to for gifts. The jewelry collection is elegant and the prices are fair for the quality.',
    name: 'Nneka E.',
    location: 'Port Harcourt',
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const testimonial = testimonials[current];

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
            What Our Customers Say
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-[2px] bg-[#D4AF37] mx-auto mt-4"
          />
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden min-h-[280px] md:min-h-[240px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full text-center px-4"
              >
                {/* Decorative quote mark */}
                <div className="mb-6">
                  <span className="font-serif text-6xl md:text-7xl text-[#D4AF37]/30 leading-none select-none">
                    &ldquo;
                  </span>
                </div>

                {/* Quote */}
                <p className="font-serif text-lg md:text-xl lg:text-2xl text-foreground/90 italic leading-relaxed mb-6">
                  {testimonial.quote}
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="size-4 text-[#D4AF37] fill-[#D4AF37]"
                    />
                  ))}
                </div>

                {/* Reviewer info */}
                <p className="text-[#D4AF37] text-sm font-medium">
                  {testimonial.name}
                  <span className="text-muted-foreground mx-2">—</span>
                  <span className="text-muted-foreground font-normal">
                    {testimonial.location}
                  </span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 size-10 rounded-full border border-white/10 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 size-10 rounded-full border border-white/10 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-8 bg-[#D4AF37]'
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
