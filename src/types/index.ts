export type Gender = 'Men' | 'Women' | 'Kids' | 'Home' | 'Beauty';

export type SortOption =
  | 'recommended'
  | 'newest'
  | 'popularity'
  | 'price_asc'
  | 'price_desc'
  | 'discount';

export type OrderStatus =
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Exchange Requested';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  gender: Gender;
  category: string;
  subCategory: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  material: string;
  careInstructions: string;
  offers: string[];
  reviews: ProductReview[];
  stock: Record<string, number>;
  createdAt: string;
  tags: string[];
}

export interface CartItem {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  pincode: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  addressType: 'Home' | 'Work';
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  gender?: 'Male' | 'Female' | 'Other';
  joinedAt: string;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percent';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
}

export interface OrderItem {
  productId: string;
  brand: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface OrderTimelineEvent {
  status: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  estimatedDelivery: string;
  status: OrderStatus;
  items: OrderItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  paymentSummary: string;
  couponCode: string | null;
  totalMrp: number;
  discountOnMrp: number;
  couponDiscount: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  timeline: OrderTimelineEvent[];
  cancelReason?: string;
  returnReason?: string;
}

export interface FilterState {
  gender: Gender | '';
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  minRating: number;
  search: string;
  sort: SortOption;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  link: string;
  image: string;
  accentLabel: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  tagline: string;
  offerText: string;
  image: string;
}

export interface CategoryTile {
  id: string;
  name: string;
  gender: Gender;
  category: string;
  offerText: string;
  image: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface StylistMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendedIds?: string[];
  stylingTip?: string;
  error?: boolean;
}
