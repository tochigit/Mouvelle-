'use client';

import { useState } from 'react';
import { X, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 32, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#D4AF37] text-[#1A1A1A] overflow-hidden relative z-50"
        >
          <div className="flex items-center justify-center h-8 px-4">
            <div className="flex items-center gap-2">
              <Truck className="size-3.5" />
              <p className="text-xs uppercase tracking-wider font-medium text-center">
                <span className="hidden sm:inline">
                  Free delivery on orders over &#8358;30,000 | Pay on Delivery available
                </span>
                <span className="sm:hidden">
                  Free delivery over &#8358;30K
                </span>
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity sm:hidden"
              aria-label="Dismiss announcement"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
