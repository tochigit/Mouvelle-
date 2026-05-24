'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { formatPriceWithDiscount } from '@/lib/format';
import type { Product } from '@/lib/types';
import StarRating from './StarRating';

interface QuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const navigate = useNavigationStore((s) => s.navigate);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const { current, original, discount } = formatPriceWithDiscount(
    product.price,
    product.discountPrice
  );

  const mainImage = product.images.find((img) => img.position === 0)?.imageUrl || product.images[0]?.imageUrl || '';

  const colors = product.variants.filter((v) => v.variantType === 'color');
  const sizes = product.variants.filter((v) => v.variantType === 'size');

  const defaultColor = colors[0]?.variantValue ?? null;
  const defaultSize = sizes[0]?.variantValue ?? null;

  const activeColor = selectedColor ?? defaultColor;
  const activeSize = selectedSize ?? defaultSize;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: mainImage,
      quantity,
      selectedColor: activeColor,
      selectedSize: activeSize,
      stockQuantity: product.stockQuantity,
    });
    toast.success('Added to bag', {
      description: `${quantity}x ${product.title} has been added to your bag.`,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const handleViewFullDetails = () => {
    navigate('product', product.id);
    onOpenChange(false);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] sm:aspect-auto sm:w-1/2 sm:min-h-[500px] bg-muted">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-[#D4AF37] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="font-serif text-xl sm:text-2xl font-semibold text-left">
                {product.title}
              </DialogTitle>
              {avgRating > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <StarRating rating={avgRating} count={product.reviews.length} size="sm" />
                </div>
              )}
            </DialogHeader>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#D4AF37]">{current}</span>
              {original && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{original}</span>
                  {discount && (
                    <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-2 py-0.5 rounded">
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3 text-left">
              {product.description}
            </DialogDescription>

            {/* Color Swatches */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Color: <span className="text-foreground">{activeColor}</span>
                </p>
                <div className="flex items-center gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.variantValue)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        activeColor === color.variantValue
                          ? 'border-[#D4AF37] scale-110'
                          : 'border-border hover:border-[#D4AF37]/50'
                      }`}
                      style={{
                        backgroundColor: color.variantValue.toLowerCase(),
                      }}
                      aria-label={`Color: ${color.variantValue}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Pills */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  Size: <span className="text-foreground">{activeSize}</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.variantValue)}
                      className={`min-w-[44px] min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeSize === size.variantValue
                          ? 'bg-[#D4AF37] text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {size.variantValue}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-[#D4AF37] hover:bg-[#C0A030] text-white font-semibold h-12 mt-2"
              disabled={product.stockQuantity === 0}
            >
              <ShoppingBag className="size-4 mr-2" />
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* View Full Details */}
            <button
              onClick={handleViewFullDetails}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors py-2"
            >
              View Full Details
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
