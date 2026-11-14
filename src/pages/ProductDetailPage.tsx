import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Heart,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  Truck,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { RatingBadge } from '../components/RatingBadge';
import { COUPONS } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import {
  checkPincodeDelivery,
  formatINR,
  getRatingBreakdown,
} from '../utils/catalogLogic';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);

  useDocumentTitle(
    product ? `${product.brand} ${product.name}` : 'Product Not Found',
    product?.description
  );

  const wishlist = useStore((s) => s.wishlist);
  const bag = useStore((s) => s.bag);
  const user = useStore((s) => s.user);
  const recentlyViewedIds = useStore((s) => s.recentlyViewed);
  const customReviewsMap = useStore((s) => s.productReviews);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToBag = useStore((s) => s.addToBag);
  const trackProductView = useStore((s) => s.trackProductView);
  const addProductReview = useStore((s) => s.addProductReview);
  const showToast = useStore((s) => s.showToast);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Pincode checker
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<ReturnType<
    typeof checkPincodeDelivery
  > | null>(null);

  // Expandable sections
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);

  // Review form
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!product) return;
    trackProductView(product.id);
    setActiveImageIdx(0);
    setSelectedColor(product.colors[0] || '');
    setSelectedSize('');
    setSizeError('');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [product, trackProductView]);

  if (!product) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#282C3F]">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-[#7E818C]">
          The item you are looking for may have moved or sold out.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const alreadyInBagWithSize = selectedSize
    ? bag.some((i) => i.productId === product.id && i.size === selectedSize)
    : false;

  const allReviews = [
    ...(customReviewsMap[product.id] || []),
    ...product.reviews,
  ];
  const breakdown = getRatingBreakdown(product);

  const similarProducts = PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category === product.category || p.gender === product.gender)
  ).slice(0, 4);

  const recentProducts = recentlyViewedIds
    .filter((rid) => rid !== product.id)
    .map((rid) => PRODUCTS.find((p) => p.id === rid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError('Please select a size before adding to your bag.');
      return;
    }
    setSizeError('');
    addToBag({
      productId: product.id,
      size: selectedSize,
      color: selectedColor || product.colors[0] || 'Standard',
      quantity: 1,
    });
    showToast(`Added ${product.brand} (${selectedSize}) to Bag`, 'success');
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product.id);
    showToast(
      added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      added ? 'success' : 'info'
    );
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeResult(checkPincodeDelivery(pincode));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      setReviewError('Please add both a headline and review comment.');
      return;
    }
    setReviewError('');
    addProductReview(product.id, {
      userName: reviewName.trim() || 'Stylo Shopper',
      rating: reviewRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      verifiedPurchase: true,
    });
    setReviewTitle('');
    setReviewComment('');
    setReviewFormOpen(false);
    showToast('Thank you! Your review has been published.', 'success');
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 pb-20 sm:px-6 md:px-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-[#7E818C]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-[#282C3F]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={`/shop/${product.gender.toLowerCase()}`}
              className="hover:text-[#282C3F]"
            >
              {product.gender}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={`/shop/${product.gender.toLowerCase()}?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#282C3F]"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-[#282C3F] truncate max-w-[200px]">
            {product.brand}
          </li>
        </ol>
      </nav>

      {/* Main PDP Split: Left Gallery + Right Contiguous Purchase Module */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left: Image Gallery with Hover Zoom */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {product.images.length > 1 && (
              <div className="flex gap-2.5 sm:w-20 sm:flex-col">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1} of ${product.name}`}
                    className={`aspect-[3/4] w-16 overflow-hidden rounded border sm:w-full ${
                      activeImageIdx === idx
                        ? 'border-[#FF3F6C] ring-1 ring-[#FF3F6C]'
                        : 'border-[#EAEAEC] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <ProductImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div
              className="relative aspect-[3/4] flex-1 overflow-hidden rounded border border-[#EAEAEC] bg-[#F5F5F6] cursor-zoom-in"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin({ x, y });
              }}
              onMouseLeave={() => setZoomOrigin(null)}
            >
              <img
                src={product.images[activeImageIdx]}
                alt={`${product.brand} ${product.name}`}
                referrerPolicy="no-referrer"
                style={
                  zoomOrigin
                    ? {
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        transform: 'scale(1.65)',
                      }
                    : undefined
                }
                className="h-full w-full object-cover object-top transition-transform duration-150"
              />
            </div>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Title & Rating */}
            <div className="border-b border-[#EAEAEC] pb-4">
              <h1 className="font-display text-xl font-extrabold uppercase tracking-wide text-[#282C3F]">
                {product.brand}
              </h1>
              <p className="mt-1 text-base text-[#7E818C] sm:text-lg">
                {product.name}
              </p>
              <a
                href="#reviews-section"
                className="mt-3 inline-flex items-center gap-2 rounded border border-[#EAEAEC] px-2.5 py-1 hover:border-[#282C3F]"
              >
                <RatingBadge rating={product.rating} count={product.ratingCount} />
                <span className="text-xs font-medium text-[#7E818C]">
                  Ratings
                </span>
              </a>
            </div>

            {/* Pricing */}
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5 tabular-nums">
                <span className="text-2xl font-bold text-[#282C3F]">
                  {formatINR(product.price)}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-base text-[#7E818C] line-through">
                      MRP {formatINR(product.mrp)}
                    </span>
                    <span className="text-base font-bold text-[#FF905A]">
                      ({product.discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold text-[#03A685]">
                inclusive of all taxes
              </p>
            </div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                  Color: <span className="font-medium text-[#7E818C]">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedColor === color
                          ? 'border-[#FF3F6C] bg-[#FF3F6C]/5 text-[#FF3F6C]'
                          : 'border-[#EAEAEC] text-[#282C3F] hover:border-[#282C3F]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector (Required before Add to Bag) */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                  Size Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => {
                  const qty = product.stock[size] ?? 0;
                  const outOfStock = qty <= 0;
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError('');
                      }}
                      aria-pressed={active}
                      className={`min-w-12 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
                        active
                          ? 'border-[#FF3F6C] bg-[#FF3F6C]/5 text-[#FF3F6C]'
                          : outOfStock
                            ? 'cursor-not-allowed border-[#EAEAEC] bg-[#F5F5F6] text-[#7E818C] line-through opacity-55'
                            : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#FF3F6C]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {selectedSize && (product.stock[selectedSize] ?? 0) <= 5 && (
                <p className="mt-2 text-xs font-semibold text-[#FF5722]">
                  Only {product.stock[selectedSize]} left in stock
                </p>
              )}

              {sizeError && (
                <p
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#ba1a1a]"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {sizeError}
                </p>
              )}
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {alreadyInBagWithSize ? (
                <button
                  type="button"
                  onClick={() => navigate('/bag')}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-[#FF3F6C] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59]"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Go to Bag
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-[#FF3F6C] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E02D59]"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Add to Bag
                </button>
              )}

              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={isWishlisted}
                className={`flex items-center justify-center gap-2 rounded border px-5 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                  isWishlisted
                    ? 'border-[#282C3F] bg-[#282C3F] text-white'
                    : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#282C3F]'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? 'fill-[#FF3F6C] text-[#FF3F6C]' : ''}`}
                  aria-hidden="true"
                />
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Pincode Delivery Checker */}
            <div className="border-t border-[#EAEAEC] pt-5">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                <Truck className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                <span>Delivery Options</span>
              </div>
              <form onSubmit={handlePincodeSubmit} className="flex max-w-xs gap-2">
                <label htmlFor="pdp-pincode" className="sr-only">
                  Enter delivery pincode
                </label>
                <input
                  id="pdp-pincode"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter pincode (e.g. 560038)"
                  className="flex-1 rounded border border-[#EAEAEC] px-3 py-2 text-sm text-[#282C3F] placeholder:text-[#7E818C] focus:border-[#282C3F] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded border border-[#EAEAEC] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:border-[#FF3F6C]"
                >
                  Check
                </button>
              </form>
              {pincodeResult && (
                <p
                  className={`mt-2 text-xs font-medium ${
                    pincodeResult.serviceable ? 'text-[#03A685]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {pincodeResult.message}
                </p>
              )}
              <ul className="mt-3 space-y-1 text-xs text-[#7E818C]">
                <li>100% Original Products</li>
                <li>Easy 14-day returns and exchanges</li>
              </ul>
            </div>

            {/* Best Offers */}
            <div className="border-t border-[#EAEAEC] pt-5">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                <Tag className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                <span>Best Offers</span>
              </div>
              <div className="space-y-2">
                {COUPONS.slice(0, 2).map((coupon) => (
                  <div
                    key={coupon.code}
                    className="flex items-center justify-between rounded border border-[#EAEAEC] bg-[#F5F5F6] px-3 py-2"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#282C3F]">
                        {coupon.title} ·{' '}
                        <span className="text-[#FF3F6C]">{coupon.code}</span>
                      </p>
                      <p className="truncate text-[11px] text-[#7E818C]">
                        {coupon.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(coupon.code);
                        showToast(`Coupon ${coupon.code} copied`, 'info');
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded border border-[#EAEAEC] bg-white px-2.5 py-1 text-[11px] font-bold text-[#282C3F] hover:border-[#FF3F6C]"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable Details */}
            <div className="divide-y divide-[#EAEAEC] border-t border-b border-[#EAEAEC]">
              <div>
                <button
                  type="button"
                  aria-expanded={detailsOpen}
                  onClick={() => setDetailsOpen((o) => !o)}
                  className="flex w-full items-center justify-between py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  <span>Product Details</span>
                  {detailsOpen ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {detailsOpen && (
                  <div className="pb-4 text-sm leading-relaxed text-[#7E818C] space-y-2">
                    <p>{product.description}</p>
                    <p className="text-xs text-[#282C3F]">
                      <strong>Category:</strong> {product.gender} · {product.category} ·{' '}
                      {product.subCategory}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  aria-expanded={careOpen}
                  onClick={() => setCareOpen((o) => !o)}
                  className="flex w-full items-center justify-between py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  <span>Material &amp; Care</span>
                  {careOpen ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {careOpen && (
                  <div className="pb-4 text-sm leading-relaxed text-[#7E818C] space-y-1.5">
                    <p>
                      <strong className="text-[#282C3F]">Fabric / Spec:</strong>{' '}
                      {product.material}
                    </p>
                    <p>
                      <strong className="text-[#282C3F]">Care:</strong>{' '}
                      {product.careInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <section
        id="reviews-section"
        aria-labelledby="reviews-heading"
        className="mt-14 border-t border-[#EAEAEC] pt-10"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="reviews-heading" className="font-display text-xl font-bold text-[#282C3F]">
            Ratings &amp; Reviews
          </h2>
          <button
            type="button"
            onClick={() => setReviewFormOpen((o) => !o)}
            className="w-fit rounded border border-[#282C3F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#282C3F] transition-colors hover:bg-[#282C3F] hover:text-white"
          >
            {reviewFormOpen ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Breakdown */}
          <div className="md:col-span-4 rounded border border-[#EAEAEC] bg-[#F5F5F6] p-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold text-[#282C3F] tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              <Star className="h-6 w-6 fill-[#03A685] text-[#03A685]" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs text-[#7E818C] tabular-nums">
              {product.ratingCount.toLocaleString('en-IN')} Verified Buyers
            </p>

            <div className="mt-5 space-y-2">
              {breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="w-6 font-semibold text-[#282C3F]">{row.stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAEAEC]">
                    <div
                      className="h-full rounded-full bg-[#03A685]"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[#7E818C]">{row.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Submission Form & List */}
          <div className="md:col-span-8 space-y-5">
            {reviewFormOpen && (
              <form
                onSubmit={handleReviewSubmit}
                className="rounded border border-[#EAEAEC] bg-white p-5 space-y-4"
              >
                <h3 className="text-sm font-bold text-[#282C3F]">
                  Share your experience
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#7E818C]">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= reviewRating
                            ? 'fill-[#03A685] text-[#03A685]'
                            : 'text-[#EAEAEC]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rev-name" className="mb-1 block text-xs font-semibold text-[#282C3F]">
                      Your Name
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Priya S."
                      className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="rev-title" className="mb-1 block text-xs font-semibold text-[#282C3F]">
                      Review Headline
                    </label>
                    <input
                      id="rev-title"
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Great fit and quality"
                      className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rev-comment" className="mb-1 block text-xs font-semibold text-[#282C3F]">
                    Review Details
                  </label>
                  <textarea
                    id="rev-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other shoppers about the fit, fabric, or color..."
                    className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                  />
                </div>

                {reviewError && (
                  <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  className="rounded bg-[#FF3F6C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
                >
                  Submit Review
                </button>
              </form>
            )}

            <div className="divide-y divide-[#EAEAEC]">
              {allReviews.map((rev) => (
                <article key={rev.id} className="py-4 first:pt-0">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 rounded bg-[#03A685] px-1.5 py-0.5 text-xs font-bold text-white tabular-nums">
                      {rev.rating}
                      <Star className="h-3 w-3 fill-white text-white" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-bold text-[#282C3F]">{rev.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#282C3F]">
                    {rev.comment}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#7E818C]">
                    <span>{rev.userName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rev.createdAt}</span>
                    {rev.verifiedPurchase && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-[#03A685] font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified Buyer
                        </span>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-14 border-t border-[#EAEAEC] pt-10">
          <h2 id="similar-heading" className="mb-6 font-display text-xl font-bold text-[#282C3F]">
            Similar Products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentProducts.length > 0 && (
        <section aria-labelledby="pdp-recent-heading" className="mt-12 border-t border-[#EAEAEC] pt-10">
          <h2 id="pdp-recent-heading" className="mb-6 font-display text-xl font-bold text-[#282C3F]">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      <Modal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        title={`Size Guide — ${product.category}`}
      >
        <p className="mb-4 text-xs text-[#7E818C]">
          Measurements are garment dimensions in inches. For a relaxed fit, consider sizing up.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-[#EAEAEC] bg-[#F5F5F6] text-[#282C3F]">
                <th className="px-3 py-2 font-bold">Size</th>
                <th className="px-3 py-2 font-bold">Chest / Bust</th>
                <th className="px-3 py-2 font-bold">Waist</th>
                <th className="px-3 py-2 font-bold">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEC] text-[#282C3F]">
              <tr>
                <td className="px-3 py-2 font-bold">S</td>
                <td className="px-3 py-2">38.0</td>
                <td className="px-3 py-2">30.0</td>
                <td className="px-3 py-2">27.5</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold">M</td>
                <td className="px-3 py-2">40.0</td>
                <td className="px-3 py-2">32.0</td>
                <td className="px-3 py-2">28.5</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold">L</td>
                <td className="px-3 py-2">42.0</td>
                <td className="px-3 py-2">34.0</td>
                <td className="px-3 py-2">29.5</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold">XL</td>
                <td className="px-3 py-2">44.0</td>
                <td className="px-3 py-2">36.0</td>
                <td className="px-3 py-2">30.5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setSizeGuideOpen(false)}
            className="inline-flex items-center gap-1.5 rounded bg-[#282C3F] px-4 py-2 text-xs font-bold uppercase text-white"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Got It
          </button>
        </div>
      </Modal>
    </main>
  );
}
