import { ASSETS } from './assets';
import type { Banner, BrandInfo, CategoryTile, Coupon, Gender, ProductReview } from '../types';

export const MEGA_MENU_DATA: Record<
  Gender,
  {
    accentColor: string;
    columns: { title: string; items: { label: string; query: string }[] }[];
  }
> = {
  Men: {
    accentColor: '#FF3F6C',
    columns: [
      {
        title: 'Topwear',
        items: [
          { label: 'Casual Shirts', query: 'category=Shirts' },
          { label: 'Oversized T-Shirts', query: 'category=T-Shirts' },
          { label: 'Jackets & Coats', query: 'category=Jackets' },
          { label: 'Sweatshirts & Hoodies', query: 'category=Sweatshirts' },
        ],
      },
      {
        title: 'Bottomwear & Footwear',
        items: [
          { label: 'Slim & Relaxed Jeans', query: 'category=Jeans' },
          { label: 'Tailored Chinos & Trousers', query: 'category=Trousers' },
          { label: 'Sneakers & Casual Shoes', query: 'category=Footwear' },
        ],
      },
      {
        title: 'Indian & Festive',
        items: [
          { label: 'Embroidered Kurtas', query: 'category=Kurtas' },
          { label: 'Nehru Jackets', query: 'category=Kurtas' },
        ],
      },
    ],
  },
  Women: {
    accentColor: '#FF3F6C',
    columns: [
      {
        title: 'Western Wear',
        items: [
          { label: 'Midi & Wrap Dresses', query: 'category=Dresses' },
          { label: 'Blouses & Tops', query: 'category=Tops' },
          { label: 'Blazers & Trench Coats', query: 'category=Jackets' },
          { label: 'High-Rise Jeans & Trousers', query: 'category=Jeans' },
        ],
      },
      {
        title: 'Ethnic & Fusion',
        items: [
          { label: 'Kurta Sets & Anarkalis', query: 'category=Kurta+Sets' },
          { label: 'Organza & Silk Sarees', query: 'category=Sarees' },
        ],
      },
      {
        title: 'Footwear & Bags',
        items: [
          { label: 'Mules, Heels & Sneakers', query: 'category=Footwear' },
          { label: 'Leather Totes & Crossbody', query: 'category=Bags' },
        ],
      },
    ],
  },
  Kids: {
    accentColor: '#FF905A',
    columns: [
      {
        title: 'Boys & Girls Clothing',
        items: [
          { label: 'Organic Cotton T-Shirts', query: 'category=T-Shirts' },
          { label: 'Sweatshirts & Hoodies', query: 'category=Sweatshirts' },
          { label: 'Party & Everyday Dresses', query: 'category=Dresses' },
          { label: 'Joggers & Denim', query: 'category=Bottomwear' },
        ],
      },
      {
        title: 'Kids Footwear',
        items: [
          { label: 'Canvas & Velcro Sneakers', query: 'category=Footwear' },
        ],
      },
    ],
  },
  Home: {
    accentColor: '#03A685',
    columns: [
      {
        title: 'Bed & Living',
        items: [
          { label: 'Waffle & Linen Bedding', query: 'category=Bedding' },
          { label: 'Handloom Cushions & Throws', query: 'category=Cushions' },
          { label: 'Artisanal Ceramic Decor', query: 'category=Decor' },
        ],
      },
      {
        title: 'Dining & Bath',
        items: [
          { label: 'Stoneware & Table Linen', query: 'category=Dining' },
          { label: 'Combed Cotton Bath Towels', query: 'category=Bath' },
        ],
      },
    ],
  },
  Beauty: {
    accentColor: '#FF3F6C',
    columns: [
      {
        title: 'Skincare & Body',
        items: [
          { label: 'Serums & Vitamin C', query: 'category=Skincare' },
          { label: 'Hydrating Moisturizers', query: 'category=Skincare' },
        ],
      },
      {
        title: 'Makeup & Fragrance',
        items: [
          { label: 'Matte Lipsticks & Tints', query: 'category=Makeup' },
          { label: 'Eau de Parfum & Mists', query: 'category=Fragrance' },
          { label: 'Botanical Haircare', query: 'category=Haircare' },
        ],
      },
    ],
  },
};

export const BANNERS: Banner[] = [
  {
    id: 'banner-autumn',
    title: 'Autumn Tailored Edit',
    subtitle: 'Structured trenches, Japanese denim, and heavyweight knits crafted for crisp city mornings.',
    ctaText: 'Shop The Edit',
    link: '/shop?sort=newest',
    image: ASSETS.heroAutumnEditorial,
    accentLabel: 'New Season Drop',
  },
  {
    id: 'banner-festive',
    title: 'The Sahr Festive Capsule',
    subtitle: 'Chanderi organza sets, silk kurtas, and artisanal handloom silhouettes for evening celebrations.',
    ctaText: 'Explore Festive',
    link: '/shop?category=Kurtas&category=Kurta+Sets&category=Sarees',
    image: ASSETS.heroEthnicFestive,
    accentLabel: 'Up to 40% Off',
  },
  {
    id: 'banner-footwear',
    title: 'Minimalist Court & Studio Footwear',
    subtitle: 'Full-grain leather sneakers, suede loafers, and cushioned everyday silhouettes.',
    ctaText: 'Step Into Style',
    link: '/shop?category=Footwear',
    image: ASSETS.catFootwearSneakers,
    accentLabel: 'Flat 25% Off',
  },
];

export const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'tile-men-casual',
    name: 'Men Linen & Shirts',
    gender: 'Men',
    category: 'Shirts',
    offerText: '30–50% Off',
    image: ASSETS.catMenCasual,
  },
  {
    id: 'tile-men-street',
    name: 'Streetwear & Denim',
    gender: 'Men',
    category: 'Jackets',
    offerText: 'Up to 45% Off',
    image: ASSETS.catMenStreetwear,
  },
  {
    id: 'tile-women-western',
    name: 'Dresses & Tailoring',
    gender: 'Women',
    category: 'Dresses',
    offerText: 'Min. 35% Off',
    image: ASSETS.catWomenWestern,
  },
  {
    id: 'tile-women-ethnic',
    name: 'Ethnic & Festive',
    gender: 'Women',
    category: 'Kurta Sets',
    offerText: 'Up to 50% Off',
    image: ASSETS.catWomenEthnic,
  },
  {
    id: 'tile-kids',
    name: 'Kids Comfort Edit',
    gender: 'Kids',
    category: 'Sweatshirts',
    offerText: 'Starting ₹599',
    image: ASSETS.catKidsApparel,
  },
  {
    id: 'tile-footwear',
    name: 'Sneakers & Footwear',
    gender: 'Men',
    category: 'Footwear',
    offerText: 'Flat 30% Off',
    image: ASSETS.catFootwearSneakers,
  },
  {
    id: 'tile-beauty',
    name: 'Clean Beauty & Scents',
    gender: 'Beauty',
    category: 'Skincare',
    offerText: 'Buy 2 Get 15% Off',
    image: ASSETS.catBeautySkincare,
  },
  {
    id: 'tile-home',
    name: 'Handloom & Living',
    gender: 'Home',
    category: 'Bedding',
    offerText: 'Up to 40% Off',
    image: ASSETS.catHomeLiving,
  },
];

export const TOP_BRANDS: BrandInfo[] = [
  {
    id: 'brand-roadster',
    name: 'Roadster Studio',
    tagline: 'Rugged Denim & Everyday Utility',
    offerText: 'Min. 40% Off',
    image: ASSETS.catMenStreetwear,
  },
  {
    id: 'brand-wrogn',
    name: 'Aurelia Loom',
    tagline: 'Contemporary Block Prints & Silk',
    offerText: 'Up to 50% Off',
    image: ASSETS.catWomenEthnic,
  },
  {
    id: 'brand-mango',
    name: 'Verona Edit',
    tagline: 'Tailored European Silhouettes',
    offerText: '30% Off New Arrivals',
    image: ASSETS.catWomenWestern,
  },
  {
    id: 'brand-nike',
    name: 'Kinetix Lab',
    tagline: 'Court Leather & Performance Knit',
    offerText: 'Flat 25% Off',
    image: ASSETS.catFootwearSneakers,
  },
  {
    id: 'brand-skinscent',
    name: 'Skinscent Atelier',
    tagline: 'Botanical Actives & Fine Fragrance',
    offerText: 'Extra 15% Off',
    image: ASSETS.catBeautySkincare,
  },
  {
    id: 'brand-kanso',
    name: 'Kanso Living',
    tagline: 'Waffle Linen & Ceramic Craft',
    offerText: 'Up to 35% Off',
    image: ASSETS.catHomeLiving,
  },
];

export const COUPONS: Coupon[] = [
  {
    code: 'FIRST20',
    title: '20% Off On Your Order',
    description: 'Get 20% instant discount up to ₹600 on orders above ₹1,499.',
    discountType: 'percent',
    value: 20,
    minOrderValue: 1499,
    maxDiscount: 600,
    expiryDate: '31 Dec 2026',
  },
  {
    code: 'STYLO100',
    title: 'Flat ₹100 Instant Savings',
    description: 'Flat ₹100 off on minimum purchase of ₹799 across all categories.',
    discountType: 'flat',
    value: 100,
    minOrderValue: 799,
    expiryDate: '31 Dec 2026',
  },
  {
    code: 'FESTIVE15',
    title: '15% Off Festive & Ethnic',
    description: '15% discount up to ₹800 on orders of ₹2,499 and above.',
    discountType: 'percent',
    value: 15,
    minOrderValue: 2499,
    maxDiscount: 800,
    expiryDate: '30 Nov 2026',
  },
  {
    code: 'STYLO500',
    title: 'Flat ₹500 Off Luxe Carts',
    description: 'Save ₹500 on curated carts of ₹3,999 or more.',
    discountType: 'flat',
    value: 500,
    minOrderValue: 3999,
    expiryDate: '31 Dec 2026',
  },
];

export const SAMPLE_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    userName: 'Ananya Sharma',
    rating: 5,
    title: 'Exceptional fabric weight and drape',
    comment: 'Fits true to size and the stitching around the seams feels boutique quality. Survived two washes with zero shrinkage.',
    createdAt: '2026-10-18',
    verifiedPurchase: true,
    helpfulCount: 14,
  },
  {
    id: 'rev-2',
    userName: 'Rohan Kulkarni',
    rating: 4,
    title: 'Great everyday staple, subtle color',
    comment: 'Color matches the studio photographs closely. Slightly relaxed fit which makes layering effortless.',
    createdAt: '2026-10-09',
    verifiedPurchase: true,
    helpfulCount: 8,
  },
  {
    id: 'rev-3',
    userName: 'Meera Nair',
    rating: 5,
    title: 'Worth every rupee',
    comment: 'Ordered for an evening dinner and received so many compliments. Delivery arrived a day early too.',
    createdAt: '2026-09-27',
    verifiedPurchase: true,
    helpfulCount: 19,
  },
];

export const TRENDING_SEARCHES = [
  'Linen Overshirt',
  'Wrap Midi Dress',
  'Block Print Kurta',
  'White Leather Sneakers',
  'Vitamin C Serum',
  'Waffle Linen Bedding',
  'Denim Trucker Jacket',
  'Kids Organic Sweatshirt',
];

export {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  PLATFORM_FEE,
} from './constants';
