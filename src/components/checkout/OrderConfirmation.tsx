'use client';

import { motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { getDeliveryTimeline } from '@/lib/format';

export default function OrderConfirmation() {
  const { navigate } = useNavigationStore();

  // Generate a pseudo order number
  const orderNumber = `ELR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center py-12"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto mb-6"
        >
          <div className="h-24 w-24 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center mx-auto">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
            >
              <Check className="h-12 w-12 text-[#D4AF37]" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Thank you for your purchase
          </p>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-lg p-5 my-6"
        >
          <p className="text-sm text-muted-foreground mb-1">Order Number</p>
          <p className="font-mono text-lg font-bold text-[#D4AF37]">{orderNumber}</p>

          <Separator className="bg-border my-4" />

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium">Order Placed</p>
                <p className="text-muted-foreground text-xs">
                  You will receive a confirmation email shortly with your order details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium">Estimated Delivery</p>
                <p className="text-muted-foreground text-xs">
                  Your order will be delivered within {getDeliveryTimeline('default')}. You can track your order status anytime.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate('shop')}
            className="w-full h-12 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold text-base"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('account')}
            className="w-full h-10 border-border"
          >
            Track Your Order
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground mt-8"
        >
          A confirmation email has been sent with your order details and tracking information.
        </motion.p>
      </motion.div>
    </div>
  );
}
