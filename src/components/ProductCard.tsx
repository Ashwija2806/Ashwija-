import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../store/useStore';
import { formatINR } from '../utils/catalogLogic';
import { ProductImage } from './ProductImage';
import { RatingBadge } from './RatingBadge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToBag = useStore((s) => s.addToBag);
  const showToast = useStore((s) => s.showToast);

  const [showQuickSizes, setShowQuickSizes] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const availableSizes = product.sizes.filter((s) => (product.stock[s] ?? 0) > 0);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast(
      added ? `${product.brand} saved to Wishlist` : `Removed from Wishlist`,
      added ? 'success' : 'info'
    );
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToBag({
      productId: product.id,
      size,
      color: product.colors[0] || 'Default',
      quantity: 1,
    });
    setShowQuickSizes(false);
    showToast(`Added ${product.brand} (${size}) to Bag`, 'success');
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded border border-[#EAEAEC] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(40,44,63,0.08)]"
      onMouseLeave={() => setShowQuickSizes(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F6]">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3F6C]"
          aria-label={`View ${product.brand} ${product.name}`}
        >
          <ProductImage
            src={product.images[0]}
            alt={`${product.brand} ${product.name}`}
            fallbackLabel={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#282C3F] shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3F6C]"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-[#FF3F6C] text-[#FF3F6C]' : 'text-[#282C3F]'
            }`}
            aria-hidden="true"
          />
        </button>

        <RatingBadge
          rating={product.rating}
          count={product.ratingCount}
          className="absolute bottom-2.5 left-2.5 z-10"
        />

        {/* Desktop quick-add bar revealed on hover */}
        <div className="absolute inset-x-0 bottom-0 z-20 hidden translate-y-full bg-white/95 p-2.5 backdrop-blur-xs transition-transform duration-200 group-hover:translate-y-0 md:block border-t border-[#EAEAEC]">
          {!showQuickSizes ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (availableSizes.length === 1) {
                  handleQuickAdd(e, availableSizes[0]);
                } else {
                  setShowQuickSizes(true);
                }
              }}
              disabled={availableSizes.length === 0}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-[#EAEAEC] bg-white py-1.5 text-xs font-bold uppercase tracking-wider text-[#282C3F] transition-colors hover:border-[#FF3F6C] hover:text-[#FF3F6C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              {availableSizes.length === 0 ? 'Out of Stock' : 'Quick Add'}
            </button>
          ) : (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                Select Size
              </p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.slice(0, 5).map((size) => {
                  const inStock = (product.stock[size] ?? 0) > 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!inStock}
                      onClick={(e) => handleQuickAdd(e, size)}
                      className="rounded border border-[#EAEAEC] px-2 py-0.5 text-[11px] font-semibold text-[#282C3F] transition-colors hover:border-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white disabled:cursor-not-allowed disabled:line-through disabled:opacity-40"
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="flex flex-1 flex-col justify-between p-3 focus:outline-none"
      >
        <div>
          <h3 className="truncate text-xs font-bold uppercase tracking-[0.06em] text-[#282C3F]">
            {product.brand}
          </h3>
          <p className="mt-0.5 truncate text-sm font-normal text-[#7E818C]">
            {product.name}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-1 sm:gap-1.5 tabular-nums">
          <span className="text-sm font-bold text-[#282C3F]">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-[11px] text-[#7E818C] line-through sm:text-xs">
                {formatINR(product.mrp)}
              </span>
              <span className="whitespace-nowrap text-[11px] font-semibold text-[#03A685] sm:text-xs">
                ({product.discountPercent}% OFF)
              </span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
