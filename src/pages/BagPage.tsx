import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProductImage } from '../components/ProductImage';
import { COUPONS, FREE_DELIVERY_THRESHOLD } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import {
  calculateBagTotals,
  formatINR,
  validateCoupon,
} from '../utils/catalogLogic';

export function BagPage() {
  useDocumentTitle('Shopping Bag', 'Review your items, apply coupons, and proceed to checkout.');

  const navigate = useNavigate();
  const bag = useStore((s) => s.bag);
  const appliedCouponCode = useStore((s) => s.appliedCouponCode);
  const removeFromBag = useStore((s) => s.removeFromBag);
  const updateBagItemQuantity = useStore((s) => s.updateBagItemQuantity);
  const updateBagItemSize = useStore((s) => s.updateBagItemSize);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const applyCouponCode = useStore((s) => s.applyCouponCode);
  const showToast = useStore((s) => s.showToast);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [couponError, setCouponError] = useState('');

  const enrichedItems = useMemo(
    () =>
      bag
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return product ? { item, product } : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [bag]
  );

  const totals = useMemo(
    () => calculateBagTotals(bag, PRODUCTS, appliedCouponCode, COUPONS),
    [bag, appliedCouponCode]
  );

  const handleApplyCoupon = (codeToTest: string) => {
    const result = validateCoupon(codeToTest, totals.sellingSubtotal, COUPONS);
    if (!result.valid) {
      setCouponError(result.message);
      return;
    }
    setCouponError('');
    applyCouponCode(result.coupon!.code);
    setCouponInput(result.coupon!.code);
    setCouponModalOpen(false);
    showToast(result.message, 'success');
  };

  const handleMoveToWishlist = (productId: string, size: string, name: string) => {
    if (!wishlist.includes(productId)) {
      toggleWishlist(productId);
    }
    removeFromBag(productId, size);
    showToast(`Moved ${name} to Wishlist`, 'info');
  };

  if (enrichedItems.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-16 pb-24 text-center">
        <div className="mx-auto max-w-md rounded border border-[#EAEAEC] bg-[#F5F5F6] px-6 py-14">
          <ShoppingBag className="mx-auto h-11 w-11 text-[#7E818C]" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-bold text-[#282C3F]">
            Hey, it feels so light!
          </h1>
          <p className="mt-1.5 text-sm text-[#7E818C]">
            There is nothing in your bag. Let&apos;s add some fresh styles from Stylo.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              to="/wishlist"
              className="rounded border border-[#FF3F6C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:bg-[#FF3F6C]/5"
            >
              Add from Wishlist
            </Link>
            <Link
              to="/shop"
              className="rounded bg-[#FF3F6C] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
            >
              Explore Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 pb-24 sm:px-6 md:px-10">
      <div className="mb-6 flex items-baseline justify-between border-b border-[#EAEAEC] pb-4">
        <h1 className="font-display text-xl font-bold text-[#282C3F] sm:text-2xl">
          Shopping Bag{' '}
          <span className="text-sm font-normal text-[#7E818C] tabular-nums">
            ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
          </span>
        </h1>
        <Link
          to="/shop"
          className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline"
        >
          Add More Items
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Free Delivery Bar + Bag Items */}
        <div className="space-y-4 lg:col-span-8">
          {/* Free Delivery Threshold Progress Bar */}
          <div className="rounded border border-[#EAEAEC] bg-[#F5F5F6] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#282C3F]">
              <Truck
                className={`h-4 w-4 ${
                  totals.amountForFreeDelivery === 0 ? 'text-[#03A685]' : 'text-[#FF3F6C]'
                }`}
                aria-hidden="true"
              />
              {totals.amountForFreeDelivery === 0 ? (
                <span className="text-[#03A685]">
                  Yay! You have unlocked FREE Express Delivery on this order.
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="tabular-nums text-[#FF3F6C]">
                    {formatINR(totals.amountForFreeDelivery)}
                  </strong>{' '}
                  more for FREE Delivery (free above {formatINR(FREE_DELIVERY_THRESHOLD)})
                </span>
              )}
            </div>
            <div
              className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EAEAEC]"
              role="progressbar"
              aria-valuenow={totals.freeDeliveryProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Free delivery threshold progress"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totals.amountForFreeDelivery === 0 ? 'bg-[#03A685]' : 'bg-[#FF3F6C]'
                }`}
                style={{ width: `${totals.freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Item Cards */}
          <div className="space-y-3">
            {enrichedItems.map(({ item, product }) => (
              <article
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 rounded border border-[#EAEAEC] bg-white p-3.5 sm:p-4"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="h-32 w-24 shrink-0 overflow-hidden rounded bg-[#F5F5F6] sm:h-36 sm:w-28"
                >
                  <ProductImage
                    src={product.images[0]}
                    alt={`${product.brand} ${product.name}`}
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                        {product.brand}
                      </h2>
                      <Link
                        to={`/product/${product.id}`}
                        className="mt-0.5 block truncate text-sm font-medium text-[#282C3F] hover:text-[#FF3F6C]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-[#7E818C]">
                        Color: {item.color}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        removeFromBag(product.id, item.size);
                        showToast(`Removed ${product.name} from Bag`, 'info');
                      }}
                      aria-label={`Remove ${product.name} size ${item.size} from bag`}
                      className="rounded p-1 text-[#7E818C] hover:bg-[#F5F5F6] hover:text-[#ba1a1a]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Size & Qty Selectors */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 rounded bg-[#F5F5F6] px-2.5 py-1 text-xs font-bold text-[#282C3F]">
                      <span>Size:</span>
                      <select
                        value={item.size}
                        aria-label={`Change size for ${product.name}`}
                        onChange={(e) =>
                          updateBagItemSize(product.id, item.size, e.target.value)
                        }
                        className="bg-transparent font-bold text-[#282C3F] focus:outline-none"
                      >
                        {product.sizes.map((s) => (
                          <option
                            key={s}
                            value={s}
                            disabled={(product.stock[s] ?? 0) <= 0}
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="inline-flex items-center gap-1.5 rounded bg-[#F5F5F6] px-2.5 py-1 text-xs font-bold text-[#282C3F]">
                      <span>Qty:</span>
                      <select
                        value={item.quantity}
                        aria-label={`Change quantity for ${product.name}`}
                        onChange={(e) =>
                          updateBagItemQuantity(
                            product.id,
                            item.size,
                            Number(e.target.value)
                          )
                        }
                        className="bg-transparent font-bold text-[#282C3F] tabular-nums focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Price & Move to Wishlist */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EAEAEC] pt-2.5">
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="text-sm font-bold text-[#282C3F]">
                        {formatINR(product.price * item.quantity)}
                      </span>
                      {product.mrp > product.price && (
                        <>
                          <span className="text-xs text-[#7E818C] line-through">
                            {formatINR(product.mrp * item.quantity)}
                          </span>
                          <span className="text-xs font-semibold text-[#03A685]">
                            {product.discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleMoveToWishlist(product.id, item.size, product.name)
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7E818C] hover:text-[#FF3F6C]"
                    >
                      <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                      Move to Wishlist
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right: Coupons & Price Summary */}
        <div className="lg:col-span-4">
          <div className="space-y-5 rounded border border-[#EAEAEC] bg-white p-5 lg:sticky lg:top-24">
            {/* Coupons */}
            <div className="border-b border-[#EAEAEC] pb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  Apply Coupon
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponError('');
                    setCouponModalOpen(true);
                  }}
                  className="rounded border border-[#FF3F6C] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white"
                >
                  {appliedCouponCode ? 'Change' : 'Apply'}
                </button>
              </div>

              {appliedCouponCode && totals.couponDiscount > 0 ? (
                <div className="mt-3 flex items-center justify-between rounded bg-[#03A685]/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#03A685]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {appliedCouponCode} applied (−{formatINR(totals.couponDiscount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      applyCouponCode(null);
                      setCouponInput('');
                      showToast('Coupon removed', 'info');
                    }}
                    aria-label="Remove applied coupon"
                    className="text-[#7E818C] hover:text-[#282C3F]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-[#7E818C]">
                  Try <strong className="text-[#282C3F]">STYLO100</strong> or{' '}
                  <strong className="text-[#282C3F]">FIRST20</strong> for instant savings.
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                Price Details ({totals.itemCount}{' '}
                {totals.itemCount === 1 ? 'Item' : 'Items'})
              </h2>

              <dl className="space-y-2.5 text-sm tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-[#7E818C]">Total MRP</dt>
                  <dd className="text-[#282C3F]">{formatINR(totals.totalMrp)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#7E818C]">Discount on MRP</dt>
                  <dd className="text-[#03A685]">
                    −{formatINR(totals.discountOnMrp)}
                  </dd>
                </div>
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-[#7E818C]">Coupon Discount</dt>
                    <dd className="text-[#03A685]">
                      −{formatINR(totals.couponDiscount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[#7E818C]">Platform Fee</dt>
                  <dd className="text-[#282C3F]">{formatINR(totals.platformFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#7E818C]">Shipping Fee</dt>
                  <dd className={totals.deliveryFee === 0 ? 'text-[#03A685] font-semibold' : 'text-[#282C3F]'}>
                    {totals.deliveryFee === 0 ? 'FREE' : formatINR(totals.deliveryFee)}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-[#EAEAEC] pt-3 text-base font-bold text-[#282C3F]">
                  <dt>Total Amount</dt>
                  <dd>{formatINR(totals.finalAmount)}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full rounded bg-[#FF3F6C] py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59]"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Coupon Modal */}
      <Modal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        title="Apply Coupon"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyCoupon(couponInput);
          }}
          className="flex gap-2"
        >
          <label htmlFor="coupon-code-input" className="sr-only">
            Enter coupon code
          </label>
          <input
            id="coupon-code-input"
            type="text"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value.toUpperCase());
              setCouponError('');
            }}
            placeholder="Enter coupon code (e.g. FIRST20)"
            className="flex-1 rounded border border-[#EAEAEC] px-3 py-2 text-sm font-semibold uppercase text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-[#FF3F6C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Check
          </button>
        </form>

        {couponError && (
          <p role="alert" className="mt-2 text-xs font-semibold text-[#ba1a1a]">
            {couponError}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7E818C]">
            Available Coupons
          </p>
          {COUPONS.map((c) => {
            const check = validateCoupon(c.code, totals.sellingSubtotal, COUPONS);
            return (
              <div
                key={c.code}
                className="flex items-start justify-between gap-3 rounded border border-[#EAEAEC] p-3"
              >
                <div>
                  <span className="inline-block rounded border border-dashed border-[#FF3F6C] bg-[#FF3F6C]/5 px-2 py-0.5 text-xs font-bold text-[#FF3F6C]">
                    {c.code}
                  </span>
                  <p className="mt-1.5 text-xs font-bold text-[#282C3F]">{c.title}</p>
                  <p className="mt-0.5 text-xs text-[#7E818C]">{c.description}</p>
                  {!check.valid && (
                    <p className="mt-1 text-[11px] font-medium text-[#FF905A]">
                      {check.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!check.valid}
                  onClick={() => handleApplyCoupon(c.code)}
                  className="shrink-0 rounded bg-[#282C3F] px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-[#FF3F6C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </main>
  );
}
