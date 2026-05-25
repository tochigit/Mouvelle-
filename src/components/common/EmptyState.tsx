'use client';

import { ShoppingBag, Heart, Package, Star, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'products' | 'orders' | 'reviews';
  onAction?: () => void;
}

const CONFIG: Record<
  EmptyStateProps['type'],
  {
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel: string;
    actionPage: 'shop' | 'home' | 'account';
  }
> = {
  cart: {
    icon: ShoppingBag,
    title: 'Your bag is empty',
    description: 'Discover our luxury collection and find something you love',
    actionLabel: 'Start Shopping',
    actionPage: 'shop',
  },
  wishlist: {
    icon: Heart,
    title: 'No saved items',
    description: 'Save your favorite pieces for later',
    actionLabel: 'Browse Collection',
    actionPage: 'shop',
  },
  products: {
    icon: Search,
    title: 'No products found',
    description: 'Try adjusting your filters',
    actionLabel: 'View All Products',
    actionPage: 'shop',
  },
  orders: {
    icon: Package,
    title: 'No orders yet',
    description: 'Your order history will appear here',
    actionLabel: 'Start Shopping',
    actionPage: 'shop',
  },
  reviews: {
    icon: Star,
    title: 'No reviews yet',
    description: 'Be the first to share your experience',
    actionLabel: 'Write a Review',
    actionPage: 'account',
  },
};

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const navigate = useNavigationStore((s) => s.navigate);
  const config = CONFIG[type];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(config.actionPage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Decorative background circle */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full scale-150" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10">
          <Icon className="size-10 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
        {config.title}
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
        {config.description}
      </p>

      <Button
        onClick={handleAction}
        className="bg-[#D4AF37] hover:bg-[#C0A030] text-white font-semibold h-11 px-8"
      >
        {config.actionLabel}
      </Button>
    </motion.div>
  );
}
