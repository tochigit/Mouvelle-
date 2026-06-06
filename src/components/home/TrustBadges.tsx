'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, MessageCircle } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary shipping on orders over ₦30,000',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Powered by Paystack. Your data is encrypted',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day hassle-free return policy',
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: 'WhatsApp support for instant assistance',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col items-center text-center p-6 md:p-8 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/[0.03] transition-all duration-500"
            >
              {/* Gold glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_30px_rgba(212,175,55,0.05)]" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center size-14 md:size-16 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] group-hover:border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/[0.1] transition-all duration-500">
                  <badge.icon className="size-6 md:size-7 text-[#D4AF37]" strokeWidth={1.5} />
                </div>

                <h3 className="text-white font-medium text-sm md:text-base mb-1.5">
                  {badge.title}
                </h3>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
