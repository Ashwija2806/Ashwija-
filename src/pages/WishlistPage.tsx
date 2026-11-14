import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProductImage } from '../components/ProductImage';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import type { Product } from '../types';
import { formatINR } from '../utils/catalogLogic';

export function WishlistPage() {
  useDocumentTitle('My Wishlist', 'View and manage your saved fashion favorites on Stylo.');

  const wishlist = useStore((s) => s.wishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const moveWishlistToBag = useStore((s) => s.moveWishlistToBag);
  const showToast = useStore((s) => s.showToast);

  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);
  const [chosenSize, setChosenSize] = useState('');

  const items = wishlist
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleMoveClick = (product: Product) => {
    const inStockSizes = product.sizes.filter((s) => (product.stock[s] ?? 0) > 0);
    if (inStockSizes.length === 0) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }
    if (inStockSizes.length === 1) {
      moveWishlistToBag(product.id, inStockSizes[0], product.colors[0] || 'Default');
      showToast(`Moved ${product.brand} to Bag`, 'success');
      return;
    }
    setChosenSize(inStockSizes[0]);
    setSizePickerProduct(product);
  };

  const confirmMoveToBag = () => {
    if (!sizePickerProduct || !chosenSize) return;
    moveWishlistToBag(
      sizePickerProduct.id,
      chosenSize,
      sizePickerProduct.colors[0] || 'Default'
    );
    showToast(`Moved ${sizePickerProduct.brand} (${chosenSize}) to Bag`, 'success');
    setSizePickerProduct(null);
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 pb-24 sm:px-6 md:px-10">
      <div className="mb-6 flex items-baseline gap-2 border-b border-[#EAEAEC] pb-4">
        <h1 className="font-display text-xl font-bold text-[#282C3F] sm:text-2xl">
          My Wishlist
        </h1>
        <span className="text-sm text-[#7E818C] tabular-nums">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto max-w-md rounded border border-[#EAEAEC] bg-[#F5F5F6] px-6 py-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-[#7E818C]" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg font-bold text-[#282C3F]">
            Your Wishlist is Empty
          </h2>
          <p className="mt-1.5 text-sm text-[#7E818C]">
            Save pieces you love while browsing to keep track of sizes and price drops.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product) => (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded border border-[#EAEAEC] bg-white"
            >
              <div className="relative aspect-[3/4] w-full bg-[#F5F5F6]">
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  <ProductImage
                    src={product.images[0]}
                    alt={`${product.brand} ${product.name}`}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    removeFromWishlist(product.id);
                    showToast(`Removed ${product.name} from Wishlist`, 'info');
                  }}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#282C3F] shadow-sm hover:text-[#FF3F6C]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <p className="truncate text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                    {product.brand}
                  </p>
                  <Link
                    to={`/product/${product.id}`}
                    className="mt-0.5 block truncate text-sm text-[#7E818C] hover:text-[#282C3F]"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-baseline gap-1.5 tabular-nums">
                    <span className="text-sm font-bold text-[#282C3F]">
                      {formatINR(product.price)}
                    </span>
                    {product.mrp > product.price && (
                      <>
                        <span className="text-xs text-[#7E818C] line-through">
                          {formatINR(product.mrp)}
                        </span>
                        <span className="text-xs font-semibold text-[#03A685]">
                          ({product.discountPercent}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleMoveClick(product)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#FF3F6C] py-2 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] transition-colors hover:bg-[#FF3F6C] hover:text-white"
                >
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                  Move to Bag
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Size Selector Modal for Moving to Bag */}
      <Modal
        open={Boolean(sizePickerProduct)}
        onClose={() => setSizePickerProduct(null)}
        title="Select Size to Move to Bag"
        maxWidthClass="max-w-sm"
      >
        {sizePickerProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-[#F5F5F6]">
                <ProductImage
                  src={sizePickerProduct.images[0]}
                  alt={sizePickerProduct.name}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-[#282C3F]">
                  {sizePickerProduct.brand}
                </p>
                <p className="truncate text-sm text-[#7E818C]">
                  {sizePickerProduct.name}
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#282C3F] tabular-nums">
                  {formatINR(sizePickerProduct.price)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sizePickerProduct.sizes.map((size) => {
                const inStock = (sizePickerProduct.stock[size] ?? 0) > 0;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!inStock}
                    onClick={() => setChosenSize(size)}
                    className={`min-w-11 rounded-full border px-3 py-1.5 text-xs font-bold ${
                      chosenSize === size
                        ? 'border-[#FF3F6C] bg-[#FF3F6C]/10 text-[#FF3F6C]'
                        : 'border-[#EAEAEC] text-[#282C3F] disabled:opacity-40'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmMoveToBag}
              className="w-full rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
            >
              Done — Move to Bag
            </button>
          </div>
        )}
      </Modal>
    </main>
  );
}
