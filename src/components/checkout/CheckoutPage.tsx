'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { formatPrice, getDeliveryFee, getDeliveryTimeline } from '@/lib/format';
import { NIGERIAN_STATES, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import type { CheckoutInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronRight,
  Truck,
  CreditCard,
  Shield,
  Check,
  MapPin,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/common/BackButton';

export default function CheckoutPage() {
  const { navigate } = useNavigationStore();
  const { items, getSubtotal, clearCart, getItemCount } = useCartStore();
  const { setLastOrder } = useOrderStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  // Form state
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    paymentMethod: 'paystack',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutInfo, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Delivery calculation
  const deliveryFee = useMemo(() => {
    if (!checkoutInfo.state) return 0;
    return getDeliveryFee(checkoutInfo.state, subtotal);
  }, [checkoutInfo.state, subtotal]);

  const deliveryTimeline = useMemo(() => {
    if (!checkoutInfo.state) return '';
    return getDeliveryTimeline(checkoutInfo.state);
  }, [checkoutInfo.state]);

  const total = subtotal + deliveryFee;

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutInfo, string>> = {};
    if (!checkoutInfo.fullName.trim()) errors.fullName = 'Full name is required';
    if (!checkoutInfo.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutInfo.email)) errors.email = 'Invalid email format';
    if (!checkoutInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!checkoutInfo.address.trim()) errors.address = 'Address is required';
    if (!checkoutInfo.state) errors.state = 'Please select a state';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: keyof CheckoutInfo, value: string) => {
    setCheckoutInfo((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Mock Paystack payment delay if paystack is selected
      if (checkoutInfo.paymentMethod === 'paystack') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: checkoutInfo.fullName,
          guestEmail: checkoutInfo.email,
          guestPhone: checkoutInfo.phone,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
          })),
          deliveryFee,
          paymentMethod: checkoutInfo.paymentMethod,
          shippingAddress: checkoutInfo.address,
          shippingState: checkoutInfo.state,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await res.json();
      setOrderId(data.order.id);
      setLastOrder(data.order.id, data.order.orderNumber, checkoutInfo.state);
      clearCart();

      if (checkoutInfo.paymentMethod === 'paystack') {
        toast.success('Payment successful! Your order has been placed.');
      } else {
        toast.success('Order placed successfully!');
      }

      navigate('checkout-success');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step indicator
  const steps = [
    { number: 1, label: 'Information' },
    { number: 2, label: 'Shipping' },
    { number: 3, label: 'Payment' },
  ];

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items before checking out</p>
          <Button
            onClick={() => navigate('shop')}
            className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground"
          >
            Go to Shop
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button + Header */}
        <div className="mb-4">
          <BackButton fallbackPage="cart" label="Back to Cart" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#D4AF37] text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {step.number}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-px bg-border mx-2 sm:mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Step 1 - Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="font-serif text-lg font-semibold">Delivery Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName" className="text-sm mb-1.5">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={checkoutInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={`h-11 bg-background ${formErrors.fullName ? 'border-red-500' : 'border-border'}`}
                  />
                  {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm mb-1.5">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={checkoutInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`h-11 bg-background ${formErrors.email ? 'border-red-500' : 'border-border'}`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm mb-1.5">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={checkoutInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+234..."
                    className={`h-11 bg-background ${formErrors.phone ? 'border-red-500' : 'border-border'}`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-sm mb-1.5">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={checkoutInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address, building, apartment"
                    className={`h-11 bg-background ${formErrors.address ? 'border-red-500' : 'border-border'}`}
                  />
                  {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                </div>
                <div>
                  <Label className="text-sm mb-1.5">State *</Label>
                  <Select
                    value={checkoutInfo.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
                    <SelectTrigger className={`h-11 bg-background ${formErrors.state ? 'border-red-500' : 'border-border'}`}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.state && <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>}
                </div>
                <div>
                  {checkoutInfo.state && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 sm:mt-8"
                    >
                      <div className="bg-[#D4AF37]/10 rounded-lg p-3 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <div className="text-sm">
                          <span className="text-[#D4AF37] font-medium">Estimated delivery: {deliveryTimeline}</span>
                          {deliveryFee === 0 ? (
                            <span className="text-green-500 ml-2">Free delivery!</span>
                          ) : (
                            <span className="text-muted-foreground ml-2">
                              Delivery fee: {formatPrice(deliveryFee)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            <Separator className="bg-border" />

            {/* Step 2 - Shipping */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="font-serif text-lg font-semibold">Shipping Method</h2>
              </div>
              <div className="border border-[#D4AF37] rounded-lg p-4 bg-[#D4AF37]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Standard Delivery</p>
                      <p className="text-xs text-muted-foreground">
                        {checkoutInfo.state ? `${deliveryTimeline} delivery` : 'Select state for timeline'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#D4AF37]">
                    {checkoutInfo.state
                      ? deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)
                      : '—'}
                  </span>
                </div>
              </div>
            </section>

            <Separator className="bg-border" />

            {/* Step 3 - Payment */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="font-serif text-lg font-semibold">Payment Method</h2>
              </div>
              <RadioGroup
                value={checkoutInfo.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
                className="space-y-3"
              >
                {/* Paystack */}
                <div
                  className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-all ${
                    checkoutInfo.paymentMethod === 'paystack'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => handleInputChange('paymentMethod', 'paystack')}
                >
                  <RadioGroupItem value="paystack" className="border-[#D4AF37] text-[#D4AF37]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Pay with Paystack</span>
                      <Badge variant="secondary" className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37]">Recommended</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Card, bank transfer, USSD — secure & instant
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                {/* Pay on Delivery */}
                <div
                  className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-all ${
                    checkoutInfo.paymentMethod === 'pay_on_delivery'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => handleInputChange('paymentMethod', 'pay_on_delivery')}
                >
                  <RadioGroupItem value="pay_on_delivery" className="border-[#D4AF37] text-[#D4AF37]" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Pay on Delivery</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pay when you receive your order
                    </p>
                  </div>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
              </RadioGroup>
            </section>

            {/* Submit Button */}
            <div className="pt-2 pb-8">
              <Button
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                className="w-full h-13 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold text-base py-3.5"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    {checkoutInfo.paymentMethod === 'paystack' ? 'Processing Payment...' : 'Placing Order...'}
                  </div>
                ) : (
                  <>
                    {checkoutInfo.paymentMethod === 'paystack' ? (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay {formatPrice(total)}
                      </>
                    ) : (
                      <>
                        Place Order — {formatPrice(total)}
                      </>
                    )}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>

          {/* Right - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Mobile Summary Toggle */}
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="lg:hidden w-full flex items-center justify-between bg-card border border-border rounded-lg p-4 mb-4"
            >
              <span className="text-sm font-medium">
                Order Summary ({itemCount} items)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37] font-bold">{formatPrice(total)}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showMobileSummary ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <div className={`lg:block ${showMobileSummary ? 'block' : 'hidden'}`}>
              <div className="bg-card rounded-lg border border-border p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
                <h3 className="font-serif text-lg font-semibold hidden lg:block">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const itemPrice = item.discountPrice || item.price;
                    return (
                      <div key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-accent">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D4AF37] text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {item.selectedColor && <span>{item.selectedColor}</span>}
                            {item.selectedColor && item.selectedSize && <span>•</span>}
                            {item.selectedSize && <span>{item.selectedSize}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-medium shrink-0">{formatPrice(itemPrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-border" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    {checkoutInfo.state ? (
                      <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                        {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Enter address</span>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-[#D4AF37]">{formatPrice(total)}</span>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-[#D4AF37]" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-[#D4AF37]" />
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
