'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BRAND_NAME } from '@/lib/constants';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success(`Welcome to the ${BRAND_NAME} Circle! Check your inbox for 10% off.`);
    setEmail('');

    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* Headline */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight">
            Join the {BRAND_NAME} Circle
          </h2>

          {/* Subtext */}
          <p className="mt-4 text-white/50 text-sm md:text-base leading-relaxed">
            Get 10% off your first order + early access to new drops
          </p>

          {/* Social proof */}
          <p className="mt-2 text-[#D4AF37] text-xs font-medium tracking-wide">
            Join 8,000+ style enthusiasts
          </p>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="mt-8 flex items-center gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-full bg-[#2A2A2A] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isSubmitting || isSuccess}
              className="size-12 rounded-full bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030] disabled:opacity-50 shrink-0"
            >
              {isSuccess ? (
                <Check className="size-5" />
              ) : isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="size-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full"
                />
              ) : (
                <ArrowRight className="size-5" />
              )}
            </Button>
          </form>

          {/* Privacy note */}
          <p className="mt-3 text-white/20 text-[10px]">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
