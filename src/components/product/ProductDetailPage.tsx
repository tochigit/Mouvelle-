'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { formatPrice, formatPriceWithDiscount, formatDate, getDeliveryFee, getDeliveryTimeline } from '@/lib/format';
import { CATEGORIES, NIGERIAN_STATES, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronRight,
  Minus,
  Plus,
  ZoomIn,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewFormDialog from '@/components/product/ReviewFormDialog';
import SizeGuideDialog from '@/components/product/SizeGuideDialog';

interface ProductWithDetails extends Product {
  avgRating: number;
  reviewCount: number;
}

export default function ProductDetailPage() {
  const { selectedProductId, navigate, selectedCategory, setCategory } = useNavigationStore();
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [sizeGuideDialogOpen, setSizeGuideDialogOpen] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Fetch product
  useEffect(() => {
    if (!selectedProductId) return;
    let cancelled = false;

    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();

        if (cancelled) return;

        setProduct(data.product);
        setSelectedImageIndex(0);
        setQuantity(1);
        setSelectedColor(null);
        setSelectedSize(null);
        setLoading(false);

        // Set default selected variants
        const colors = (data.product.variants ?? []).filter((v: { variantType: string }) => v.variantType === 'color');
        const sizes = (data.product.variants ?? []).filter((v: { variantType: string }) => v.variantType === 'size');
        if (colors.length > 0) setSelectedColor(colors[0].variantValue);
        if (sizes.length > 0) setSelectedSize(sizes[0].variantValue);

        // Fetch related products
        const relatedRes = await fetch(`/api/products?category=${data.product.category}&limit=6`);
        const related = await relatedRes.json();
        if (!cancelled) {
          setRelatedProducts(
            (related.products as ProductWithDetails[]).filter((p) => p.id !== data.product.id)
          );
        }
      } catch {
        if (!cancelled) {
          toast.error('Product not found');
          navigate('shop');
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [selectedProductId, navigate]);

  // Zoom handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  // Refresh reviews after submission
  const handleReviewSubmitted = () => {
    if (!selectedProductId) return;
    fetch(`/api/products/${selectedProductId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
      })
      .catch(() => {
        toast.error('Failed to refresh reviews');
      });
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0]?.imageUrl || '',
      quantity,
      selectedColor,
      selectedSize,
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${product.title} added to bag`);
  };

  // Buy now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('checkout');
  };

  // Toggle wishlist
  const handleToggleWishlist = () => {
    if (!product) return;
    toggleItem(product.id);
    if (isInWishlist(product.id)) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  // Stock status
  const getStockStatus = () => {
    if (!product) return { text: '', color: '' };
    if (product.stockQuantity === 0) return { text: 'Out of Stock', color: 'text-red-500' };
    if (product.stockQuantity <= 5) return { text: `Low Stock (${product.stockQuantity} left)`, color: 'text-amber-500' };
    return { text: 'In Stock', color: 'text-green-500' };
  };

  // Rating distribution
  const getRatingDistribution = (reviews: Review[]) => {
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist.map((count, i) => ({
      stars: i + 1,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const priceInfo = formatPriceWithDiscount(product.price, product.discountPrice);
  const stockStatus = getStockStatus();
  const productImages = product.images ?? [];
  const productVariants = product.variants ?? [];
  const productReviews = product.reviews ?? [];
  const colors = productVariants.filter((v) => v.variantType === 'color');
  const sizes = productVariants.filter((v) => v.variantType === 'size');
  const ratingDistribution = getRatingDistribution(productReviews);

  const colorMap: Record<string, string> = {
    'Black': '#1A1A1A', 'White': '#FFFFFF', 'Gold': '#D4AF37', 'Rose Gold': '#B76E79',
    'Silver': '#C0C0C0', 'Brown': '#8B4513', 'Navy': '#000080', 'Red': '#DC2626',
    'Blue': '#3B82F6', 'Green': '#22C55E', 'Pink': '#EC4899', 'Purple': '#8B5CF6',
    'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Tortoise': '#8B4513', 'Gray': '#6B7280',
    'Grey': '#6B7280', 'Amber': '#F59E0B', 'Olive': '#808000',
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
          <button onClick={() => { setCategory(product.category); navigate('shop'); }} className="hover:text-[#D4AF37] transition-colors">
            {product.category}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </nav>

        {/* Back button on mobile */}
        <button
          onClick={() => navigate('shop')}
          className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-[#D4AF37] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </button>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Images (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="flex gap-3">
              {/* Thumbnail Strip (Desktop) */}
              <div className="hidden lg:flex flex-col gap-2 w-16">
                {productImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative aspect-[4/5] w-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === i ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || product.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div
                ref={mainImageRef}
                className="relative flex-1 aspect-[4/5] rounded-lg overflow-hidden cursor-crosshair bg-card"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={productImages[selectedImageIndex]?.imageUrl || ''}
                      alt={product.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-200"
                      style={isZooming ? {
                        transform: 'scale(2)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      } : undefined}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badge Overlay */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-[#D4AF37] text-primary-foreground text-xs uppercase tracking-wider font-semibold">
                      {product.badge}
                    </Badge>
                  </div>
                )}

                {/* Zoom Icon */}
                <div className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2">
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Mobile Thumbnails */}
            <div className="flex gap-2 mt-3 lg:hidden overflow-x-auto pb-2">
              {productImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative aspect-square w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === i ? 'border-[#D4AF37]' : 'border-transparent opacity-60'
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || product.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Product Info (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 space-y-5">
              {/* Badge */}
              {product.badge && (
                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs uppercase tracking-wider font-semibold border-[#D4AF37]/20">
                  {product.badge}
                </Badge>
              )}

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{product.title}</h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-[#D4AF37] text-2xl font-bold">{priceInfo.current}</span>
                {priceInfo.original && (
                  <span className="text-muted-foreground line-through text-lg">{priceInfo.original}</span>
                )}
                {priceInfo.discount && (
                  <Badge className="bg-red-600 text-white text-xs">-{priceInfo.discount}%</Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.avgRating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
                >
                  {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {product.description}
              </p>

              <Separator className="bg-border" />

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Color:</span>
                    <span className="text-sm text-muted-foreground">{selectedColor}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedColor(v.variantValue)}
                        className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                          selectedColor === v.variantValue
                            ? 'border-[#D4AF37] scale-110'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        title={v.variantValue}
                      >
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: colorMap[v.variantValue] || '#888' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Size:</span>
                    <button onClick={() => setSizeGuideDialogOpen(true)} className="text-xs text-[#D4AF37] hover:underline">Size Guide</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedSize(v.variantValue)}
                        className={`h-9 min-w-[44px] px-3 rounded-full text-sm font-medium border transition-all ${
                          selectedSize === v.variantValue
                            ? 'bg-[#D4AF37] text-primary-foreground border-[#D4AF37]'
                            : 'bg-background border-border hover:border-[#D4AF37]'
                        } ${v.stockQuantity === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={v.stockQuantity === 0}
                      >
                        {v.variantValue}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center hover:bg-accent transition-colors rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-10 w-12 flex items-center justify-center text-sm font-medium border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="h-10 w-10 flex items-center justify-center hover:bg-accent transition-colors rounded-r-lg"
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold text-base"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="w-full h-12 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold text-base"
                  disabled={product.stockQuantity === 0}
                >
                  Buy Now
                </Button>
              </div>

              {/* Wishlist */}
              <button
                onClick={handleToggleWishlist}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                {isInWishlist(product.id) ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>

              <Separator className="bg-border" />

              {/* Trust Icons */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center gap-1">
                  <Truck className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-[10px] text-muted-foreground leading-tight">Free Delivery over ₦30K</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <Shield className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-[10px] text-muted-foreground leading-tight">Premium Quality</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <RefreshCw className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-[10px] text-muted-foreground leading-tight">Easy Returns</span>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Product Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0">
                  <TabsTrigger
                    value="details"
                    className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 text-xs sm:text-sm"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="materials"
                    className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 text-xs sm:text-sm"
                  >
                    Materials
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 text-xs sm:text-sm"
                  >
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger
                    value="care"
                    className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 text-xs sm:text-sm"
                  >
                    Care
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                  {product.tags && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.tags.split(',').map((tag) => (
                        <Badge key={tag.trim()} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="materials" className="pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Crafted with premium materials sourced from the finest suppliers. Each piece undergoes rigorous quality
                    checks to ensure it meets our exacting standards. The attention to detail in every stitch and finish
                    reflects our commitment to luxury craftsmanship.
                  </p>
                </TabsContent>
                <TabsContent value="shipping" className="pt-4">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      We deliver across Nigeria. Delivery timelines vary by location:
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Lagos</span>
                        <span className="text-foreground">1-2 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ogun</span>
                        <span className="text-foreground">2-3 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Abuja</span>
                        <span className="text-foreground">2-4 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other states</span>
                        <span className="text-foreground">3-5 business days</span>
                      </div>
                    </div>
                    <p className="text-[#D4AF37]">
                      Free delivery on orders above {formatPrice(FREE_DELIVERY_THRESHOLD)}
                    </p>
                    <Separator className="bg-border my-3" />
                    <p className="font-medium text-foreground">Returns Policy</p>
                    <p>
                      We accept returns within 7 days of delivery for items in their original condition.
                      Items must be unworn with tags attached. Contact our support team to initiate a return.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="care" className="pt-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>To maintain the quality and longevity of your purchase:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Store in a cool, dry place away from direct sunlight</li>
                      <li>Avoid contact with water, perfumes, and harsh chemicals</li>
                      <li>Clean gently with a soft, dry cloth</li>
                      <li>Use the provided dust bag or box for storage</li>
                      <li>Handle with care to preserve the finish</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="mt-16">
          <Separator className="bg-border mb-10" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-[#D4AF37]">
                  {product.avgRating.toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(product.avgRating)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.reverse().map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8">{item.stars}★</span>
                    <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{item.count}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(true)}
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                Write a Review
              </Button>
            </div>

            {/* Individual Reviews */}
            <div className="lg:col-span-2">
              {productReviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {productReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.authorName}</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Form Dialog */}
        <ReviewFormDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          productId={product.id}
          onReviewSubmitted={handleReviewSubmitted}
        />

        {/* Size Guide Dialog */}
        <SizeGuideDialog
          open={sizeGuideDialogOpen}
          onOpenChange={setSizeGuideDialogOpen}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <Separator className="bg-border mb-10" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6">You May Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
              {relatedProducts.map((rp) => {
                const rpPrice = formatPriceWithDiscount(rp.price, rp.discountPrice);
                return (
                  <motion.div
                    key={rp.id}
                    whileHover={{ y: -4 }}
                    className="shrink-0 w-44 sm:w-52 cursor-pointer"
                    onClick={() => navigate('product', rp.id)}
                  >
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-card mb-2">
                      <Image
                        src={rp.images?.[0]?.imageUrl || ''}
                        alt={rp.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {rp.badge && (
                        <Badge className="absolute top-2 left-2 bg-[#D4AF37] text-primary-foreground text-[9px]">
                          {rp.badge}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-serif text-xs sm:text-sm font-medium line-clamp-1">{rp.title}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[#D4AF37] text-xs sm:text-sm font-semibold">{rpPrice.current}</span>
                      {rpPrice.original && (
                        <span className="text-muted-foreground text-[10px] line-through">{rpPrice.original}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
