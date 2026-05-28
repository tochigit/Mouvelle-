'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/format';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Minus, Plus, X, ArrowRight, Shield, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/common/BackButton';

export default function CartPage() {
  const { navigate } = useNavigationStore();
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const freeDeliveryProgress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    message: string;
  } | null>(null);

  const discountAmount = promoResult?.discountAmount || 0;
  const total = subtotal - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal: subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid promo code');
        setPromoResult(null);
        return;
      }

      setPromoResult(data);
      toast.success(data.message);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoResult(null);
    toast.info('Promo code removed');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('home')} className="hover:text-[#D4AF37] transition-colors">
            Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallbackPage="shop" label="Back to Shop" />
        </div>

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl font-bold mb-2"
        >
          Shopping Cart
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-8">
          {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
        </p>

        {items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-24 w-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Looks like you haven&apos;t added anything to your cart yet. Explore our collection and find something you love.
            </p>
            <Button
              onClick={() => navigate('shop')}
              className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free delivery progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg p-4 border border-border"
              >
                {isFreeDelivery ? (
                  <p className="text-sm text-green-500 font-medium">
                    🎉 You qualify for free delivery!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Add <span className="text-[#D4AF37] font-semibold">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> more for free delivery
                    </p>
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${freeDeliveryProgress}%` }}
                        className="h-full bg-[#D4AF37] rounded-full"
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Items List */}
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const itemPrice = item.discountPrice || item.price;
                  return (
                    <motion.div
                      key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-card rounded-lg border border-border p-4 sm:p-5"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div
                          className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-lg overflow-hidden bg-accent cursor-pointer"
                          onClick={() => navigate('product', item.productId)}
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className="font-serif text-base sm:text-lg font-medium line-clamp-1 cursor-pointer hover:text-[#D4AF37] transition-colors"
                              onClick={() => navigate('product', item.productId)}
                            >
                              {item.title}
                            </h3>
                            <button
                              onClick={() => {
                                removeItem(item.productId, item.selectedColor, item.selectedSize);
                                toast.info('Item removed from cart');
                              }}
                              className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="flex items-center gap-2 mt-1">
                            {item.selectedColor && (
                              <Badge variant="secondary" className="text-xs">
                                {item.selectedColor}
                              </Badge>
                            )}
                            {item.selectedSize && (
                              <Badge variant="secondary" className="text-xs">
                                Size: {item.selectedSize}
                              </Badge>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[#D4AF37] font-semibold">
                              {formatPrice(itemPrice)}
                            </span>
                            {item.discountPrice && (
                              <span className="text-muted-foreground text-sm line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity & Total */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity - 1)}
                                className="h-9 w-9 flex items-center justify-center hover:bg-accent transition-colors rounded-l-lg"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="h-9 w-10 flex items-center justify-center text-sm font-medium border-x border-border">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity + 1)}
                                className="h-9 w-9 flex items-center justify-center hover:bg-accent transition-colors rounded-r-lg"
                                disabled={item.quantity >= item.stockQuantity}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold">
                              {formatPrice(itemPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('shop')}
                  className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-lg border border-border p-5 sm:p-6 space-y-5">
                <h2 className="font-serif text-xl font-bold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Promo Code</label>
                  {promoResult ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">
                          {promoResult.code}
                        </Badge>
                        <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                          -{formatPrice(promoResult.discountAmount)}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Remove promo code"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyPromo(); }}
                        placeholder="Enter code"
                        className="h-9 text-sm border-border bg-background"
                        disabled={promoLoading}
                      />
                      <Button
                        variant="outline"
                        className="h-9 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 shrink-0"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-border" />

                {/* Total */}
                <div className="space-y-2">
                  {promoResult && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount ({promoResult.code})</span>
                      <span className="text-green-500 font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#D4AF37]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => navigate('checkout')}
                  className="w-full h-12 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold text-base"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-[#D4AF37]" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <RefreshCw className="h-4 w-4 text-[#D4AF37]" />
                    Free Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
