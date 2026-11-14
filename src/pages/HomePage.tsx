import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Carousel } from '../components/Carousel';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { BANNERS, CATEGORY_TILES, TOP_BRANDS } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { useCountdown } from '../hooks/useCountdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';

export function HomePage() {
  useDocumentTitle(
    'Stylo — High-Street Fashion, Beauty & Lifestyle Store',
    'Shop curated fashion, footwear, kids, beauty, and home decor on Stylo.'
  );

  const countdown = useCountdown(14 * 3600 + 27 * 60 + 48);
  const recentlyViewedIds = useStore((s) => s.recentlyViewed);

  const dealIds = ['men-01', 'women-01', 'women-02', 'beauty-01'];
  const dealProducts = dealIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const trendingIds = [
    'men-02',
    'women-04',
    'men-08',
    'kids-01',
    'home-01',
    'beauty-02',
    'men-06',
    'women-11',
  ];
  const trendingProducts = trendingIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  return (
    <main className="bg-white">
      {/* 1. Hero Auto-Play Carousel */}
      <Carousel banners={BANNERS} />

      <div className="mx-auto max-w-[1440px] space-y-14 px-4 py-10 sm:px-6 md:px-10 md:py-14">
        {/* 2. Deal of the Day with Countdown Timer */}
        <section aria-labelledby="deal-of-day-heading">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#EAEAEC] pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#FF3F6C]">
                Limited Time Offers
              </p>
              <h2
                id="deal-of-day-heading"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-[#282C3F] md:text-[28px]"
              >
                Deal of the Day
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div
                className="flex items-center gap-2 rounded border border-[#EAEAEC] bg-[#F5F5F6] px-3.5 py-2 text-xs font-bold text-[#282C3F] tabular-nums"
                aria-label={`Deal ends in ${countdown.hours} hours ${countdown.minutes} minutes ${countdown.seconds} seconds`}
              >
                <Clock className="h-4 w-4 text-[#FF905A]" aria-hidden="true" />
                <span className="text-[#7E818C] font-medium">Ends in</span>
                <span>
                  {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
                </span>
              </div>

              <Link
                to="/shop?sort=discount"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline"
              >
                View All Deals
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 3. Shop By Category */}
        <section aria-labelledby="shop-category-heading">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7E818C]">
                Departments
              </p>
              <h2
                id="shop-category-heading"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-[#282C3F] md:text-[28px]"
              >
                Shop by Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:text-[#FF3F6C]"
            >
              Browse Catalog
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 lg:gap-6">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.id}
                to={`/shop/${tile.gender.toLowerCase()}?category=${encodeURIComponent(tile.category)}`}
                className="group relative overflow-hidden rounded border border-[#EAEAEC] bg-[#F5F5F6] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(40,44,63,0.08)]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <ProductImage
                    src={tile.image}
                    alt={tile.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#282C3F]/90 via-[#282C3F]/55 to-transparent p-3.5 pt-12 text-white"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF905A]">
                    {tile.offerText}
                  </p>
                  <h3 className="mt-0.5 font-display text-sm font-bold sm:text-base">
                    {tile.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Top Brands */}
        <section aria-labelledby="top-brands-heading">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7E818C]">
              Featured Labels
            </p>
            <h2
              id="top-brands-heading"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-[#282C3F] md:text-[28px]"
            >
              Top Brands on Stylo
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
            {TOP_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group flex flex-col overflow-hidden rounded border border-[#EAEAEC] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(40,44,63,0.08)]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#F5F5F6]">
                  <ProductImage
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-3">
                  <h3 className="truncate font-display text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                    {brand.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-[#7E818C]">
                    {brand.tagline}
                  </p>
                  <p className="mt-1.5 text-xs font-bold text-[#03A685]">
                    {brand.offerText}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Trending Now */}
        <section aria-labelledby="trending-heading">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#FF3F6C]">
                Most Loved
              </p>
              <h2
                id="trending-heading"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-[#282C3F] md:text-[28px]"
              >
                Trending Now
              </h2>
            </div>
            <Link
              to="/shop?sort=popularity"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:text-[#FF3F6C]"
            >
              See All Trending
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 6. Recently Viewed (if any) */}
        {recentlyViewedProducts.length > 0 && (
          <section aria-labelledby="recently-viewed-heading" className="border-t border-[#EAEAEC] pt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="recently-viewed-heading"
                className="font-display text-xl font-bold text-[#282C3F]"
              >
                Recently Viewed
              </h2>
              <Link
                to="/shop"
                className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline"
              >
                Continue Exploring
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {recentlyViewedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
