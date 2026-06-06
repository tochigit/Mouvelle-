'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';

export default function WhatsAppButton() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex items-center justify-center rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BD5A] text-white bottom-20 right-4 md:bottom-6 md:right-6"
      style={{ width: 56, height: 56 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(37, 211, 102, 0.4)',
          '0 0 0 12px rgba(37, 211, 102, 0)',
        ],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-6 fill-white" />
    </motion.a>
  );
}
