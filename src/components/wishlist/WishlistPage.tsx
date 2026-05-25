'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import { formatPriceWithDiscount } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  ShoppingBag,
  X,
  ArrowRight,
  ChevronRight,
  Trash2,
  ShoppingBagIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { navigate } = useNavigationStore();
  const { items, removeItem, _hasHydrated } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for each wishlist item
  useEffect(() => {
    if (!_hasHydrated) return;

    const fetchWishlistProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const productPromises = items.map(async (id) => {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return data.product as Product;
        });

        const results = await Promise.all(productPromises);
        // Filter out any null results (products that may have been deleted)
        const validProducts = results.filter((p): p is Product => p !== null);
        setProducts(validProducts);
      } catch {
        toast.error('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [items, _hasHydrated]);

  const handleRemove = (productId: string, title: string) => {
    removeItem(productId);
    toast.success('Removed from wishlist', {
      description: title,
    });
  };

  const handleMoveToCart = (product: Product) => {
    const images = product.images ?? [];
    const variants = product.variants ?? [];
    const mainImage = images.find((img) => img.position === 0)?.imageUrl || images[0]?.imageUrl || '';

    const colors = variants.filter((v) => v.variantType === 'color');
    const sizes = variants.filter((v) => v.variantType === 'size');
    const defaultColor = colors[0]?.variantValue ?? null;
    const defaultSize = sizes[0]?.variantValue ?? null;

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

    removeItem(product.id);
    toast.success('Moved to bag', {
      description: `${product.title} has been added to your bag.`,
    });
  };

  const handleClearAll = () => {
    items.forEach((id) => removeItem(id));
    toast.success('Wishlist cleared');
  };

  // Empty state
  if (_hasHydrated && items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('home')} className="hover:text-[#D4AF37] transition-colors">
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Wishlist</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-24 w-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Save items you love to your wishlist. Revisit them anytime and never miss out on your favorites.
            </p>
            <Button
              onClick={() => navigate('shop')}
              className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('home')} className="hover:text-[#D4AF37] transition-colors">
            Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Wishlist</span>
        </nav>

        {/* Page Title */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-3xl sm:text-4xl font-bold mb-2"
            >
              My Wishlist
            </motion.h1>
            <p className="text-sm text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-red-500 hover:border-red-500/50 shrink-0"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => {
                const images = product.images ?? [];
                const mainImage = images.find((img) => img.position === 0)?.imageUrl || images[0]?.imageUrl || '';
                const { current, original, discount } = formatPriceWithDiscount(
                  product.price,
                  product.discountPrice
                );

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      {/* Image Container */}
                      <div
                        className="relative aspect-[4/5] bg-muted cursor-pointer overflow-hidden"
                        onClick={() => navigate('product', product.id)}
                      >
                        <Image
                          src={mainImage}
                          alt={product.title}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />

                        {/* Badge */}
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-[#D4AF37] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10">
                            {product.badge}
                          </span>
                        )}

                        {/* Discount Badge */}
                        {discount && (
                          <span
                            className="absolute top-3 bg-red-500 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10"
                            style={product.badge ? { left: 'auto', right: '3rem' } : { left: '0.75rem' }}
                          >
                            -{discount}%
                          </span>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(product.id, product.title);
                          }}
                          className="absolute top-3 right-3 z-10 flex items-center justify-center size-9 rounded-full bg-background/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <X className="size-4" />
                        </button>

                        {/* Move to Cart Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToCart(product);
                            }}
                            className="w-full bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold text-xs uppercase tracking-wider h-10"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                            Move to Bag
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-4 space-y-2">
                        <h3
                          className="font-medium text-sm text-foreground truncate cursor-pointer hover:text-[#D4AF37] transition-colors"
                          onClick={() => navigate('product', product.id)}
                        >
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

                        {/* Mobile Move to Cart Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveToCart(product)}
                          className="w-full mt-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-primary-foreground text-xs min-h-[36px] sm:hidden"
                        >
                          <ShoppingBagIcon className="h-3.5 w-3.5 mr-1.5" />
                          Move to Bag
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Continue Shopping Link */}
        {items.length > 0 && (
          <div className="pt-8">
            <button
              onClick={() => navigate('shop')}
              className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
