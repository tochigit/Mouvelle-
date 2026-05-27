'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useOrderStore } from '@/stores/order';
import { formatPrice, formatDate, getDeliveryTimeline } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  MapPin,
  CreditCard,
  PackageCheck,
  CircleDot,
  X,
  Loader2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/common/BackButton';

interface OrderItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  itemPrice: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    images: { imageUrl: string; altText: string | null }[];
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  totalAmount: number;
  deliveryFee: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  shippingAddress: string | null;
  shippingState: string | null;
  createdAt: string;
  items: OrderItemWithProduct[];
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'paid', label: 'Payment Confirmed', icon: CreditCard },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
  paid: { label: 'Paid', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  processing: { label: 'Processing', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  shipped: { label: 'Shipped', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
};

function getStatusStepIndex(status: string): number {
  if (status === 'cancelled') return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = getStatusStepIndex(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border hidden sm:block" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-[#D4AF37] hidden sm:block transition-all duration-500"
          style={{
            width: isCancelled
              ? '0%'
              : `${Math.max(0, (currentIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
          }}
        />

        <div className="flex justify-between relative">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = !isCancelled && index <= currentIndex;
            const isCurrent = !isCancelled && index === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-[#D4AF37] border-[#D4AF37] text-primary-foreground' : ''}
                    ${isCurrent ? 'ring-4 ring-[#D4AF37]/20 scale-110' : ''}
                    ${!isCompleted ? 'bg-background border-border text-muted-foreground' : ''}
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`
                    mt-2 text-[9px] sm:text-xs text-center leading-tight
                    ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ order, onClose }: { order: OrderData; onClose: () => void }) {
  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const deliveryTimeline = getDeliveryTimeline(order.shippingState || 'default');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Order Details</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Order <span className="font-mono font-bold text-[#D4AF37]">{order.orderNumber}</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 h-9 w-9 rounded-full hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Badge & Date */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border font-medium`}>
          {statusConfig.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Placed on {formatDate(order.createdAt)}
        </span>
      </div>

      {/* Timeline */}
      {order.orderStatus !== 'cancelled' && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="font-serif text-lg font-semibold mb-2">Order Progress</h3>
          <OrderTimeline status={order.orderStatus} />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-[#D4AF37]" />
            <span>Estimated delivery: <span className="font-medium text-foreground">{deliveryTimeline}</span></span>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">
          Items ({order.items.length})
        </h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={item.id}>
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-accent">
                  {item.product.images?.[0]?.imageUrl ? (
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm sm:text-base font-medium line-clamp-1">
                    {item.product.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
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
                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                  <p className="text-[#D4AF37] font-semibold mt-1">
                    {formatPrice(item.itemPrice * item.quantity)}
                  </p>
                </div>
              </div>
              {index < order.items.length - 1 && <Separator className="mt-4 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping Info */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#D4AF37]" />
            <h3 className="font-serif text-base font-semibold">Shipping Address</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {order.shippingAddress || 'No address provided'}
          </p>
          {order.shippingState && (
            <p className="text-sm text-muted-foreground mt-1">{order.shippingState} State</p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#D4AF37]" />
            <h3 className="font-serif text-base font-semibold">Payment Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium capitalize">
                {order.paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery' : order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${STATUS_CONFIG[order.paymentStatus]?.color || ''}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
        <h3 className="font-serif text-base font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.totalAmount - order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Free'}</span>
          </div>
          <Separator className="bg-border" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-[#D4AF37]">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AccountPage() {
  const { navigate } = useNavigationStore();
  const { lastOrderNumber, lastOrderId } = useOrderStore();

  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewedOrder, setViewedOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState('');
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [emailOrders, setEmailOrders] = useState<OrderData[]>([]);
  const [isEmailSearch, setIsEmailSearch] = useState(false);

  // Auto-load last order if available
  useEffect(() => {
    if (lastOrderNumber && !viewedOrder) {
      setSearchInput(lastOrderNumber);
    }
  }, [lastOrderNumber, viewedOrder]);

  // Load recent orders from the order store's last order
  useEffect(() => {
    async function fetchLastOrder() {
      if (lastOrderId) {
        try {
          const res = await fetch(`/api/orders/${lastOrderId}`);
          if (res.ok) {
            const data = await res.json();
            setRecentOrders([data.order]);
          }
        } catch {
          // silently ignore
        }
      }
    }
    fetchLastOrder();
  }, [lastOrderId]);

  // Detect if input is email or order number
  const detectInputType = (value: string): 'order' | 'email' | 'unknown' => {
    const trimmed = value.trim();
    if (trimmed.toUpperCase().startsWith('ELR-')) return 'order';
    if (trimmed.includes('@') && trimmed.includes('.')) return 'email';
    return 'unknown';
  };

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) {
      toast.error('Please enter an order number or email address');
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setNotFoundMessage('');
    setViewedOrder(null);
    setEmailOrders([]);
    setIsEmailSearch(false);

    try {
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(query)}`);
      if (res.status === 404) {
        const data = await res.json();
        setNotFound(true);
        setNotFoundMessage(data.error || 'Order not found');
        toast.error(data.error || 'Order not found');
      } else if (!res.ok) {
        toast.error('Something went wrong. Please try again.');
      } else {
        const data = await res.json();
        const orders: OrderData[] = data.orders;

        if (orders.length === 1) {
          // Single order — show details directly
          setViewedOrder(orders[0]);
          // Add to recent orders if not already there
          setRecentOrders((prev) => {
            const exists = prev.some((o) => o.orderNumber === orders[0].orderNumber);
            if (exists) return prev;
            return [orders[0], ...prev].slice(0, 5);
          });
          toast.success('Order found!');
        } else if (orders.length > 1) {
          // Multiple orders (email search) — show list
          setIsEmailSearch(true);
          setEmailOrders(orders);
          // Add all to recent orders
          setRecentOrders((prev) => {
            const existing = new Set(prev.map((o) => o.orderNumber));
            const newOrders = orders.filter((o) => !existing.has(o.orderNumber));
            return [...newOrders, ...prev].slice(0, 10);
          });
          toast.success(`Found ${orders.length} order${orders.length !== 1 ? 's' : ''}`);
        }
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (order: OrderData) => {
    setViewedOrder(order);
    setSearchInput(order.orderNumber);
    setNotFound(false);
    setEmailOrders([]);
    setIsEmailSearch(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputType = detectInputType(searchInput);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('home')} className="hover:text-[#D4AF37] transition-colors">
            Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">My Account</span>
        </nav>

        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallbackPage="home" label="Back to Home" />
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Track your orders and view order details
          </p>
        </motion.div>

        {/* Order Lookup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-5 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold">Track Your Order</h2>
              <p className="text-sm text-muted-foreground">Enter your order number or email address</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {inputType === 'email' ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </div>
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setNotFound(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Enter order number or email"
                className="h-12 text-base pl-10 border-border bg-background focus-visible:ring-[#D4AF37]"
                disabled={isLoading}
              />
              {searchInput.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      inputType === 'email'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : inputType === 'order'
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {inputType === 'email'
                      ? 'Email lookup'
                      : inputType === 'order'
                      ? 'Order #'
                      : 'Order # or email'}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-12 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Search by order number (ELR-XXXXX) or the email address used when placing your order.
          </p>
        </motion.div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {viewedOrder ? (
            <OrderDetails
              order={viewedOrder}
              onClose={() => {
                setViewedOrder(null);
                setSearchInput('');
              }}
            />
          ) : isEmailSearch && emailOrders.length > 0 ? (
            <motion.div
              key="email-orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  Your Orders ({emailOrders.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEmailOrders([]);
                    setIsEmailSearch(false);
                    setSearchInput('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing all orders for <span className="font-medium text-foreground">{searchInput}</span>
              </p>
              <div className="space-y-3">
                {emailOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
                      onClick={() => handleViewOrder(order)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                            <PackageCheck className="h-5 w-5 text-[#D4AF37]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-[#D4AF37] text-sm">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border text-xs hidden sm:inline-flex`}>
                            {statusConfig.label}
                          </Badge>
                          <span className="font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : notFound ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-8 sm:p-12 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {notFoundMessage || "We couldn't find an order matching your search. Please double-check and try again."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setNotFound(false);
                  setNotFoundMessage('');
                  setSearchInput('');
                }}
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Recent Orders Section */}
              {recentOrders.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold mb-4">Recent Orders</h2>
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
                          onClick={() => handleViewOrder(order)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="h-12 w-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                                <PackageCheck className="h-5 w-5 text-[#D4AF37]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-mono font-bold text-[#D4AF37] text-sm">
                                  {order.orderNumber}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border text-xs hidden sm:inline-flex`}>
                                {statusConfig.label}
                              </Badge>
                              <span className="font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State / Welcome */}
              {recentOrders.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="h-24 w-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                    <CircleDot className="h-10 w-10 text-[#D4AF37]" />
                  </div>
                  <h2 className="font-serif text-2xl mb-2">No Orders to Track</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You haven&apos;t placed any orders yet, or your order history isn&apos;t available. Enter your order number or email above to track a specific order.
                  </p>
                  <Button
                    onClick={() => navigate('shop')}
                    className="bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Start Shopping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-lg p-5 text-center"
                >
                  <Truck className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
                  <h3 className="font-serif text-base font-semibold mb-1">Fast Delivery</h3>
                  <p className="text-xs text-muted-foreground">
                    1-5 business days depending on your location
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border rounded-lg p-5 text-center"
                >
                  <Package className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
                  <h3 className="font-serif text-base font-semibold mb-1">Order Tracking</h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time updates on your order status and delivery
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-border rounded-lg p-5 text-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
                  <h3 className="font-serif text-base font-semibold mb-1">Secure Shopping</h3>
                  <p className="text-xs text-muted-foreground">
                    Safe payments and guaranteed satisfaction on every order
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('shop')}
            className="text-sm text-[#D4AF37] hover:underline inline-flex items-center gap-1"
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
