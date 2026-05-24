'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ShoppingBag, Minus, Plus, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CartSidebar() {
  const { navigate } = useNavigationStore();
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('checkout');
  };

  const handleViewCart = () => {
    setCartOpen(false);
    navigate('cart');
  };

  const handleContinueShopping = () => {
    setCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-background p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl flex items-center gap-2">
              Shopping Bag
              {itemCount > 0 && (
                <span className="text-sm font-sans font-normal text-muted-foreground">
                  ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator className="bg-border" />

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="h-20 w-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-lg">Your bag is empty</h3>
              <p className="text-sm text-muted-foreground">
                Discover our curated collection of luxury pieces
              </p>
              <Button
                onClick={handleContinueShopping}
                className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground"
              >
                Start Shopping
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const itemPrice = item.discountPrice || item.price;
                    return (
                      <motion.div
                        key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3"
                      >
                        {/* Image */}
                        <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-card">
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
                            <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                            <button
                              onClick={() => {
                                removeItem(item.productId, item.selectedColor, item.selectedSize);
                                toast.info('Item removed from bag');
                              }}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.selectedColor && (
                              <span className="text-xs text-muted-foreground">{item.selectedColor}</span>
                            )}
                            {item.selectedColor && item.selectedSize && (
                              <span className="text-xs text-muted-foreground">•</span>
                            )}
                            {item.selectedSize && (
                              <span className="text-xs text-muted-foreground">{item.selectedSize}</span>
                            )}
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[#D4AF37] text-sm font-semibold">
                              {formatPrice(itemPrice * item.quantity)}
                            </span>
                            <div className="flex items-center border border-border rounded-md">
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity - 1)}
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors rounded-l-md"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="h-7 w-8 flex items-center justify-center text-xs font-medium border-x border-border">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity + 1)}
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors rounded-r-md"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <Separator className="bg-border" />

            {/* Footer */}
            <div className="px-5 py-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-[#D4AF37]">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Delivery fee calculated at checkout</p>

              {/* Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-11 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleViewCart}
                  variant="outline"
                  className="w-full h-9 border-border text-sm"
                >
                  View Cart
                </Button>
              </div>

              <button
                onClick={handleContinueShopping}
                className="w-full text-center text-xs text-[#D4AF37] hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
