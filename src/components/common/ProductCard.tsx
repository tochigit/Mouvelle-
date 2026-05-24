'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { formatPriceWithDiscount } from '@/lib/format';
import type { Product } from '@/lib/types';
import StarRating from './StarRating';
import QuickView from './QuickView';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const navigate = useNavigationStore((s) => s.navigate);
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const wishlisted = isInWishlist(product.id);

  const { current, original, discount } = formatPriceWithDiscount(
    product.price,
    product.discountPrice
  );

  const avgRating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const images = product.images ?? [];
  const variants = product.variants ?? [];
  const mainImage = images.find((img) => img.position === 0)?.imageUrl || images[0]?.imageUrl || '';

  const colors = variants.filter((v) => v.variantType === 'color');
  const sizes = variants.filter((v) => v.variantType === 'size');
  const defaultColor = colors[0]?.variantValue ?? null;
  const defaultSize = sizes[0]?.variantValue ?? null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: mainImage,
      quantity: 1,
      selectedColor: defaultColor,
      selectedSize: defaultSize,
      stockQuantity: product.stockQuantity,
    });
    toast.success('Added to bag', {
      description: `${product.title} has been added to your bag.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      description: product.title,
    });
  };

  const handleCardClick = () => {
    navigate('product', product.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted mb-3">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 ease-out ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#D4AF37] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10">
              {product.badge}
            </span>
          )}

          {/* Discount Badge */}
          {discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10" style={product.badge ? { left: 'auto', right: '3rem' } : {}}>
              -{discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 flex items-center justify-center size-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`size-4 transition-colors ${
                wishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-foreground'
              }`}
            />
          </button>

          {/* Quick View Overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 pointer-events-none"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="pointer-events-auto flex items-center gap-2 bg-background/90 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-background transition-colors"
            >
              <Eye className="size-4" />
              Quick View
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm text-foreground truncate group-hover:text-[#D4AF37] transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#D4AF37]">{current}</span>
            {original && (
              <span className="text-xs text-muted-foreground line-through">
                {original}
              </span>
            )}
          </div>

          {avgRating > 0 && (
            <StarRating rating={avgRating} count={reviewCount} size="sm" />
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C0A030] text-white text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-lg transition-colors min-h-[44px]"
          >
            <ShoppingBag className="size-3.5" />
            Add to Cart
          </button>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickView
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  );
}
