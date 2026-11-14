import {
  FREE_DELIVERY_THRESHOLD,
  PLATFORM_FEE,
  STANDARD_DELIVERY_FEE,
} from '../data/constants';
import type {
  CartItem,
  Coupon,
  FilterState,
  Gender,
  Product,
  SortOption,
} from '../types';

export const DEFAULT_FILTERS: FilterState = {
  gender: '',
  categories: [],
  brands: [],
  colors: [],
  sizes: [],
  minPrice: 0,
  maxPrice: 7000,
  minDiscount: 0,
  minRating: 0,
  search: '',
  sort: 'recommended',
};

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const searchTerm = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.gender && product.gender !== filters.gender) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    if (
      filters.colors.length > 0 &&
      !product.colors.some((c) => filters.colors.includes(c))
    ) {
      return false;
    }

    if (
      filters.sizes.length > 0 &&
      !product.sizes.some((s) => filters.sizes.includes(s) && (product.stock[s] ?? 0) > 0)
    ) {
      return false;
    }

    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }

    if (filters.minDiscount > 0 && product.discountPercent < filters.minDiscount) {
      return false;
    }

    if (filters.minRating > 0 && product.rating < filters.minRating) {
      return false;
    }

    if (searchTerm) {
      const haystack = [
        product.name,
        product.brand,
        product.gender,
        product.category,
        product.subCategory,
        ...product.tags,
        ...product.colors,
      ]
        .join(' ')
        .toLowerCase();

      const words = searchTerm.split(/\s+/).filter(Boolean);
      const matchesAll = words.every((w) => haystack.includes(w));
      if (!matchesAll) return false;
    }

    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'popularity':
      return list.sort((a, b) => b.ratingCount - a.ratingCount);
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price);
    case 'discount':
      return list.sort((a, b) => b.discountPercent - a.discountPercent);
    case 'recommended':
    default: {
      const scored = list.sort((a, b) => {
        const scoreA = a.rating * 20 + Math.log10(Math.max(10, a.ratingCount)) * 10;
        const scoreB = b.rating * 20 + Math.log10(Math.max(10, b.ratingCount)) * 10;
        return scoreB - scoreA;
      });
      const buckets = new Map<string, Product[]>();
      for (const item of scored) {
        const group = buckets.get(item.gender) || [];
        group.push(item);
        buckets.set(item.gender, group);
      }
      const result: Product[] = [];
      const keys = Array.from(buckets.keys());
      let added = true;
      while (added) {
        added = false;
        for (const k of keys) {
          const next = buckets.get(k)?.shift();
          if (next) {
            result.push(next);
            added = true;
          }
        }
      }
      return result;
    }
  }
}

export function paginateProducts(
  products: Product[],
  page: number,
  pageSize: number
): { items: Product[]; totalPages: number; hasMore: boolean } {
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const end = safePage * pageSize;
  return {
    items: products.slice(0, end),
    totalPages,
    hasMore: end < products.length,
  };
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.gender) params.set('gender', filters.gender);
  filters.categories.forEach((c) => params.append('category', c));
  filters.brands.forEach((b) => params.append('brand', b));
  filters.colors.forEach((c) => params.append('color', c));
  filters.sizes.forEach((s) => params.append('size', s));
  if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice < 7000) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minDiscount > 0) params.set('discount', String(filters.minDiscount));
  if (filters.minRating > 0) params.set('rating', String(filters.minRating));
  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.sort && filters.sort !== 'recommended') params.set('sort', filters.sort);
  return params;
}

const VALID_GENDERS: Gender[] = ['Men', 'Women', 'Kids', 'Home', 'Beauty'];
const VALID_SORTS: SortOption[] = [
  'recommended',
  'newest',
  'popularity',
  'price_asc',
  'price_desc',
  'discount',
];

export function searchParamsToFilters(
  params: URLSearchParams,
  routeGender?: string
): FilterState {
  const rawGender = routeGender || params.get('gender') || '';
  const matchedGender = VALID_GENDERS.find(
    (g) => g.toLowerCase() === rawGender.toLowerCase()
  );

  const rawSort = params.get('sort') as SortOption | null;
  const sort = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : 'recommended';

  const minPrice = Number(params.get('minPrice') || 0);
  const maxPrice = Number(params.get('maxPrice') || 7000);
  const minDiscount = Number(params.get('discount') || 0);
  const minRating = Number(params.get('rating') || 0);

  return {
    gender: matchedGender || '',
    categories: params.getAll('category').filter(Boolean),
    brands: params.getAll('brand').filter(Boolean),
    colors: params.getAll('color').filter(Boolean),
    sizes: params.getAll('size').filter(Boolean),
    minPrice: Number.isFinite(minPrice) && minPrice >= 0 ? minPrice : 0,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : 7000,
    minDiscount: Number.isFinite(minDiscount) ? minDiscount : 0,
    minRating: Number.isFinite(minRating) ? minRating : 0,
    search: params.get('q') || '',
    sort,
  };
}

export interface BagTotals {
  itemCount: number;
  totalMrp: number;
  sellingSubtotal: number;
  discountOnMrp: number;
  couponDiscount: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  amountForFreeDelivery: number;
  freeDeliveryProgress: number;
}

export function validateCoupon(
  code: string,
  sellingSubtotal: number,
  coupons: Coupon[]
): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, discount: 0, message: 'Enter a coupon code.' };
  }

  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon "${normalized}" is invalid or expired.`,
    };
  }

  if (sellingSubtotal < coupon.minOrderValue) {
    return {
      valid: false,
      coupon,
      discount: 0,
      message: `Add ${formatINR(coupon.minOrderValue - sellingSubtotal)} more to unlock ${coupon.code}.`,
    };
  }

  let discount =
    coupon.discountType === 'flat'
      ? coupon.value
      : Math.round((sellingSubtotal * coupon.value) / 100);

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.min(discount, sellingSubtotal);

  return {
    valid: true,
    coupon,
    discount,
    message: `${coupon.code} applied! You saved ${formatINR(discount)}.`,
  };
}

export function calculateBagTotals(
  bag: CartItem[],
  products: Product[],
  appliedCouponCode: string | null,
  coupons: Coupon[]
): BagTotals {
  let itemCount = 0;
  let totalMrp = 0;
  let sellingSubtotal = 0;

  for (const item of bag) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    itemCount += item.quantity;
    totalMrp += product.mrp * item.quantity;
    sellingSubtotal += product.price * item.quantity;
  }

  const discountOnMrp = Math.max(0, totalMrp - sellingSubtotal);

  let couponDiscount = 0;
  if (appliedCouponCode && sellingSubtotal > 0) {
    const result = validateCoupon(appliedCouponCode, sellingSubtotal, coupons);
    if (result.valid) {
      couponDiscount = result.discount;
    }
  }

  const afterCoupon = Math.max(0, sellingSubtotal - couponDiscount);
  const deliveryFee =
    itemCount === 0 || afterCoupon >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const platformFee = itemCount === 0 ? 0 : PLATFORM_FEE;
  const finalAmount = afterCoupon + deliveryFee + platformFee;
  const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - afterCoupon);
  const freeDeliveryProgress =
    itemCount === 0
      ? 0
      : Math.min(100, Math.round((afterCoupon / FREE_DELIVERY_THRESHOLD) * 100));

  return {
    itemCount,
    totalMrp,
    sellingSubtotal,
    discountOnMrp,
    couponDiscount,
    deliveryFee,
    platformFee,
    finalAmount,
    amountForFreeDelivery,
    freeDeliveryProgress,
  };
}

export function checkPincodeDelivery(pincode: string): {
  valid: boolean;
  serviceable: boolean;
  estimatedDays: number;
  codAvailable: boolean;
  message: string;
} {
  const cleaned = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return {
      valid: false,
      serviceable: false,
      estimatedDays: 0,
      codAvailable: false,
      message: 'Please enter a valid 6-digit Indian pincode.',
    };
  }

  // Non-serviceable demo edge case: pincodes ending in 999
  if (cleaned.endsWith('999')) {
    return {
      valid: true,
      serviceable: false,
      estimatedDays: 0,
      codAvailable: false,
      message: `Sorry, express delivery is currently unavailable for ${cleaned}.`,
    };
  }

  const firstDigit = Number(cleaned[0]);
  const estimatedDays = firstDigit <= 4 ? 2 : firstDigit <= 7 ? 3 : 4;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  const formatted = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return {
    valid: true,
    serviceable: true,
    estimatedDays,
    codAvailable: true,
    message: `Delivery by ${formatted} · Pay on Delivery available`,
  };
}

export function validateCardDetails(card: {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}): string | null {
  const digits = card.number.replace(/\s+/g, '');
  if (!/^\d{16}$/.test(digits)) {
    return 'Enter a valid 16-digit card number.';
  }
  if (card.name.trim().length < 2) {
    return 'Enter the cardholder name.';
  }
  const match = card.expiry.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    return 'Enter expiry in MM/YY format.';
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'Card expiry date is in the past.';
  }
  if (!/^\d{3,4}$/.test(card.cvv.trim())) {
    return 'Enter a valid 3 or 4 digit CVV.';
  }
  return null;
}

export function getRatingBreakdown(product: Product): { stars: number; count: number; percent: number }[] {
  const base = Math.max(10, product.ratingCount);
  const avg = product.rating;
  // Deterministic distribution anchored to product rating
  const five = Math.min(82, Math.max(35, Math.round((avg - 2.5) * 32)));
  const four = Math.min(40, Math.max(12, Math.round((5 - Math.abs(avg - 4.2)) * 8)));
  const three = Math.max(4, Math.round((100 - five - four) * 0.55));
  const two = Math.max(1, Math.round((100 - five - four) * 0.25));
  const one = Math.max(1, 100 - five - four - three - two);

  const percents = [five, four, three, two, one];
  return [5, 4, 3, 2, 1].map((stars, idx) => ({
    stars,
    percent: percents[idx],
    count: Math.round((base * percents[idx]) / 100),
  }));
}
