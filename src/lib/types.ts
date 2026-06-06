export type PageView = 'home' | 'shop' | 'collections' | 'product' | 'cart' | 'checkout' | 'checkout-success' | 'account' | 'wishlist' | 'admin';

export type Category = 'Perfumes' | 'Sunglasses' | 'Jewelry' | 'Fashion Accessories';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  variantType: string; // "color" or "size"
  variantValue: string;
  stockQuantity: number;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  tags: string | null;
  featured: boolean;
  badge: string | null;
  stockQuantity: number;
  condition: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  discountPrice: number | null;
  image: string;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  stockQuantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  itemPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  totalAmount: number;
  deliveryFee: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;
  shippingAddress?: string;
  shippingState?: string;
  deliveryConfirmedAt?: string | null;
  deliveredAt?: string | null;
  shipmentReference?: string | null;
  adminNotes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  paymentMethod: 'paystack' | 'pay_on_delivery';
}
