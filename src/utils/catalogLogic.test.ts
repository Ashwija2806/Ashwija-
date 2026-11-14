import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FILTERS,
  calculateBagTotals,
  checkPincodeDelivery,
  filterProducts,
  filtersToSearchParams,
  paginateProducts,
  searchParamsToFilters,
  sortProducts,
  validateCardDetails,
  validateCoupon,
} from './catalogLogic';
import type { Coupon, Product } from '../types';

const MOCK_COUPONS: Coupon[] = [
  {
    code: 'FIRST20',
    title: '20% Off',
    description: '20% off up to 600',
    discountType: 'percent',
    value: 20,
    minOrderValue: 1499,
    maxDiscount: 600,
    expiryDate: '31 Dec 2026',
  },
  {
    code: 'STYLO100',
    title: 'Flat 100',
    description: 'Flat 100 off',
    discountType: 'flat',
    value: 100,
    minOrderValue: 799,
    expiryDate: '31 Dec 2026',
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    brand: 'Roadster Studio',
    name: 'Linen Overshirt',
    gender: 'Men',
    category: 'Shirts',
    subCategory: 'Casual',
    price: 1500,
    mrp: 2500,
    discountPercent: 40,
    rating: 4.6,
    ratingCount: 1200,
    colors: ['Olive', 'Beige'],
    sizes: ['M', 'L'],
    images: ['img1.jpg'],
    description: 'Linen shirt',
    material: '100% Linen',
    careInstructions: 'Wash cold',
    offers: [],
    reviews: [],
    stock: { M: 5, L: 0 },
    createdAt: '2026-11-10',
    tags: ['linen', 'summer'],
  },
  {
    id: 'p2',
    brand: 'Verona Edit',
    name: 'Terracotta Wrap Dress',
    gender: 'Women',
    category: 'Dresses',
    subCategory: 'Midi',
    price: 2000,
    mrp: 4000,
    discountPercent: 50,
    rating: 4.8,
    ratingCount: 800,
    colors: ['Terracotta'],
    sizes: ['S', 'M'],
    images: ['img2.jpg'],
    description: 'Wrap dress',
    material: 'Linen blend',
    careInstructions: 'Gentle wash',
    offers: [],
    reviews: [],
    stock: { S: 4, M: 3 },
    createdAt: '2026-11-12',
    tags: ['dress', 'brunch'],
  },
  {
    id: 'p3',
    brand: 'TinyLoft',
    name: 'Organic Sweatshirt',
    gender: 'Kids',
    category: 'Sweatshirts',
    subCategory: 'Pullovers',
    price: 800,
    mrp: 1000,
    discountPercent: 20,
    rating: 4.2,
    ratingCount: 300,
    colors: ['Yellow'],
    sizes: ['4-5Y'],
    images: ['img3.jpg'],
    description: 'Kids pullover',
    material: 'Organic cotton',
    careInstructions: 'Wash warm',
    offers: [],
    reviews: [],
    stock: { '4-5Y': 10 },
    createdAt: '2026-11-01',
    tags: ['kids', 'cotton'],
  },
];

test('filterProducts filters by gender, price, discount, size stock, and search', () => {
  const menOnly = filterProducts(MOCK_PRODUCTS, { ...DEFAULT_FILTERS, gender: 'Men' });
  assert.equal(menOnly.length, 1);
  assert.equal(menOnly[0].id, 'p1');

  // Size L has 0 stock on p1 so filtering for size L should exclude p1
  const sizeL = filterProducts(MOCK_PRODUCTS, { ...DEFAULT_FILTERS, sizes: ['L'] });
  assert.equal(sizeL.length, 0);

  const highDiscount = filterProducts(MOCK_PRODUCTS, { ...DEFAULT_FILTERS, minDiscount: 45 });
  assert.equal(highDiscount.length, 1);
  assert.equal(highDiscount[0].id, 'p2');

  const searchDress = filterProducts(MOCK_PRODUCTS, { ...DEFAULT_FILTERS, search: 'verona dress' });
  assert.equal(searchDress.length, 1);
  assert.equal(searchDress[0].id, 'p2');
});

test('sortProducts orders by price, newest, popularity, and discount', () => {
  const byPriceAsc = sortProducts(MOCK_PRODUCTS, 'price_asc');
  assert.deepEqual(byPriceAsc.map((p) => p.id), ['p3', 'p1', 'p2']);

  const byNewest = sortProducts(MOCK_PRODUCTS, 'newest');
  assert.deepEqual(byNewest.map((p) => p.id), ['p2', 'p1', 'p3']);

  const byPopularity = sortProducts(MOCK_PRODUCTS, 'popularity');
  assert.deepEqual(byPopularity.map((p) => p.id), ['p1', 'p2', 'p3']);

  const byDiscount = sortProducts(MOCK_PRODUCTS, 'discount');
  assert.deepEqual(byDiscount.map((p) => p.id), ['p2', 'p1', 'p3']);
});

test('URL query param serialization and parsing round-trips cleanly', () => {
  const initial = {
    ...DEFAULT_FILTERS,
    gender: 'Women' as const,
    categories: ['Dresses', 'Tops'],
    brands: ['Verona Edit'],
    minPrice: 500,
    maxPrice: 3500,
    minDiscount: 30,
    minRating: 4,
    search: 'wrap',
    sort: 'price_desc' as const,
  };
  const params = filtersToSearchParams(initial);
  const parsed = searchParamsToFilters(params);
  assert.deepEqual(parsed, initial);
});

test('validateCoupon and calculateBagTotals compute discounts and free delivery threshold', () => {
  const invalid = validateCoupon('NOPE', 2000, MOCK_COUPONS);
  assert.equal(invalid.valid, false);

  const belowMin = validateCoupon('FIRST20', 1000, MOCK_COUPONS);
  assert.equal(belowMin.valid, false);

  const validFirst20 = validateCoupon('first20', 5000, MOCK_COUPONS);
  assert.equal(validFirst20.valid, true);
  assert.equal(validFirst20.discount, 600); // capped at maxDiscount 600

  // Cart below 999 gets 79 delivery fee + 20 platform fee
  const smallCart = calculateBagTotals(
    [{ productId: 'p3', size: '4-5Y', color: 'Yellow', quantity: 1 }],
    MOCK_PRODUCTS,
    null,
    MOCK_COUPONS
  );
  assert.equal(smallCart.sellingSubtotal, 800);
  assert.equal(smallCart.deliveryFee, 79);
  assert.equal(smallCart.platformFee, 20);
  assert.equal(smallCart.finalAmount, 899);

  // Cart above 999 with FIRST20 applied gets free delivery
  const bigCart = calculateBagTotals(
    [{ productId: 'p2', size: 'M', color: 'Terracotta', quantity: 1 }],
    MOCK_PRODUCTS,
    'FIRST20',
    MOCK_COUPONS
  );
  assert.equal(bigCart.totalMrp, 4000);
  assert.equal(bigCart.sellingSubtotal, 2000);
  assert.equal(bigCart.discountOnMrp, 2000);
  assert.equal(bigCart.couponDiscount, 400);
  assert.equal(bigCart.deliveryFee, 0);
  assert.equal(bigCart.finalAmount, 1620); // 2000 - 400 + 20 platform fee
});

test('checkPincodeDelivery, paginateProducts, and validateCardDetails behave deterministically', () => {
  assert.equal(checkPincodeDelivery('123').valid, false);
  assert.equal(checkPincodeDelivery('560999').serviceable, false);
  const okPin = checkPincodeDelivery('400001');
  assert.equal(okPin.valid, true);
  assert.equal(okPin.serviceable, true);
  assert.equal(okPin.estimatedDays, 2);

  const paged = paginateProducts(MOCK_PRODUCTS, 1, 2);
  assert.equal(paged.items.length, 2);
  assert.equal(paged.hasMore, true);
  assert.equal(paged.totalPages, 2);

  assert.ok(
    validateCardDetails({
      number: '4111 1111 1111',
      name: 'Asha',
      expiry: '12/29',
      cvv: '123',
    }) !== null
  );
  assert.equal(
    validateCardDetails({
      number: '4111 1111 1111 1111',
      name: 'Asha Rao',
      expiry: '12/29',
      cvv: '123',
    }),
    null
  );
});
