import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { FilterState, SortOption } from '../types';
import {
  DEFAULT_FILTERS,
  filterProducts,
  filtersToSearchParams,
  paginateProducts,
  searchParamsToFilters,
  sortProducts,
} from '../utils/catalogLogic';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: "What's New" },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Better Discount' },
];

const PAGE_SIZE = 12;

export function ShopPage() {
  const { gender: routeGender } = useParams<{ gender?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams, routeGender),
    [searchParams, routeGender]
  );

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  const headingLabel = filters.search
    ? `Search: "${filters.search}"`
    : filters.gender
      ? `${filters.gender}'s Collection`
      : 'All Fashion & Lifestyle';

  useDocumentTitle(`${headingLabel} — Shop`, `Browse ${headingLabel} on Stylo.`);

  useEffect(() => {
    setDraftFilters(filters);
    setPage(1);
    setIsLoading(true);
    const t = window.setTimeout(() => setIsLoading(false), 160);
    return () => window.clearTimeout(t);
  }, [filters]);

  const applyFilters = (next: FilterState) => {
    const nextParams = filtersToSearchParams(next);
    if (routeGender && next.gender.toLowerCase() !== routeGender.toLowerCase()) {
      navigate(
        next.gender
          ? `/shop/${next.gender.toLowerCase()}?${nextParams.toString()}`
          : `/shop?${nextParams.toString()}`
      );
      return;
    }
    if (routeGender) {
      nextParams.delete('gender');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    navigate('/shop');
  };

  const availableCategories = useMemo(() => {
    const scoped = filters.gender
      ? PRODUCTS.filter((p) => p.gender === filters.gender)
      : PRODUCTS;
    return Array.from(new Set(scoped.map((p) => p.category))).sort();
  }, [filters.gender]);

  const filteredList = useMemo(
    () => filterProducts(PRODUCTS, filters),
    [filters]
  );

  const sortedList = useMemo(
    () => sortProducts(filteredList, filters.sort),
    [filteredList, filters.sort]
  );

  const { items: visibleProducts, hasMore } = useMemo(
    () => paginateProducts(sortedList, page, PAGE_SIZE),
    [sortedList, page]
  );

  // Active filter chips for quick removal
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.gender) {
    activeChips.push({
      key: `gender-${filters.gender}`,
      label: filters.gender,
      onRemove: () => applyFilters({ ...filters, gender: '' }),
    });
  }
  filters.categories.forEach((cat) =>
    activeChips.push({
      key: `cat-${cat}`,
      label: cat,
      onRemove: () =>
        applyFilters({
          ...filters,
          categories: filters.categories.filter((c) => c !== cat),
        }),
    })
  );
  filters.brands.forEach((b) =>
    activeChips.push({
      key: `brand-${b}`,
      label: b,
      onRemove: () =>
        applyFilters({
          ...filters,
          brands: filters.brands.filter((x) => x !== b),
        }),
    })
  );
  filters.colors.forEach((c) =>
    activeChips.push({
      key: `color-${c}`,
      label: `Color: ${c}`,
      onRemove: () =>
        applyFilters({
          ...filters,
          colors: filters.colors.filter((x) => x !== c),
        }),
    })
  );
  filters.sizes.forEach((s) =>
    activeChips.push({
      key: `size-${s}`,
      label: `Size: ${s}`,
      onRemove: () =>
        applyFilters({
          ...filters,
          sizes: filters.sizes.filter((x) => x !== s),
        }),
    })
  );
  if (filters.maxPrice < 7000) {
    activeChips.push({
      key: 'maxPrice',
      label: `Under ₹${filters.maxPrice.toLocaleString('en-IN')}`,
      onRemove: () => applyFilters({ ...filters, maxPrice: 7000 }),
    });
  }
  if (filters.minDiscount > 0) {
    activeChips.push({
      key: 'discount',
      label: `${filters.minDiscount}%+ Off`,
      onRemove: () => applyFilters({ ...filters, minDiscount: 0 }),
    });
  }
  if (filters.minRating > 0) {
    activeChips.push({
      key: 'rating',
      label: `${filters.minRating}★ & above`,
      onRemove: () => applyFilters({ ...filters, minRating: 0 }),
    });
  }
  if (filters.search) {
    activeChips.push({
      key: 'search',
      label: `"${filters.search}"`,
      onRemove: () => applyFilters({ ...filters, search: '' }),
    });
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 pb-24 sm:px-6 md:px-10 md:pb-12">
      {/* Breadcrumb & Header */}
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-[#7E818C]">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-[#282C3F]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-[#282C3F]">{headingLabel}</li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#EAEAEC] pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-[#282C3F] sm:text-2xl">
            {headingLabel}
          </h1>
          <p className="mt-0.5 text-xs text-[#7E818C] tabular-nums">
            Showing {visibleProducts.length} of {sortedList.length} items
          </p>
        </div>

        {/* Desktop Sort Dropdown */}
        <div className="hidden items-center gap-2 md:flex">
          <label htmlFor="desktop-sort" className="text-xs font-bold text-[#7E818C]">
            Sort by:
          </label>
          <select
            id="desktop-sort"
            value={filters.sort}
            onChange={(e) =>
              applyFilters({ ...filters, sort: e.target.value as SortOption })
            }
            className="rounded border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-bold text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded bg-[#282C3F] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#FF3F6C]"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-[#FF3F6C] hover:underline ml-1"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Mobile Inline Sort / Filter Toolbar */}
      <div className="mb-4 grid grid-cols-2 overflow-hidden rounded border border-[#EAEAEC] bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="flex h-11 items-center justify-center gap-2 border-r border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#282C3F]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
          Sort
        </button>
        <button
          type="button"
          onClick={() => {
            setDraftFilters(filters);
            setMobileFilterOpen(true);
          }}
          className="flex h-11 items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#282C3F]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filter{activeChips.length > 0 ? ` (${activeChips.length})` : ''}
        </button>
      </div>

      {/* Main 12-Col Layout: 3-Col Sidebar + 9-Col Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="hidden lg:col-span-3 lg:block">
          <FilterSidebar
            filters={filters}
            onChange={applyFilters}
            onClearAll={clearAllFilters}
            availableCategories={availableCategories}
          />
        </div>

        <div className="lg:col-span-9">
          {isLoading ? (
            <div
              aria-label="Loading products"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse overflow-hidden rounded border border-[#EAEAEC] bg-white"
                >
                  <div className="aspect-[3/4] w-full bg-[#F5F5F6]" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-1/2 rounded bg-[#EAEAEC]" />
                    <div className="h-3 w-4/5 rounded bg-[#F5F5F6]" />
                    <div className="h-4 w-1/3 rounded bg-[#EAEAEC]" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded border border-[#EAEAEC] bg-[#F5F5F6] px-6 py-16 text-center">
              <p className="font-display text-lg font-bold text-[#282C3F]">
                No matching items found
              </p>
              <p className="mt-1.5 max-w-md text-sm text-[#7E818C]">
                Try clearing a few filters, expanding your price range, or searching for another style.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-5 inline-flex items-center gap-2 rounded bg-[#FF3F6C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-xs text-[#7E818C] tabular-nums">
                    Showing {visibleProducts.length} of {sortedList.length} products
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded border border-[#282C3F] bg-white px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#282C3F] transition-colors hover:bg-[#282C3F] hover:text-white"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Sort Bottom Sheet */}
      {mobileSortOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-[#282C3F]/60 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Sort products"
          onClick={() => setMobileSortOpen(false)}
        >
          <div
            className="w-full rounded-t-xl bg-white pb-6 shadow-[0_-4px_20px_rgba(40,44,63,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[#EAEAEC]" />
            <div className="flex items-center justify-between border-b border-[#EAEAEC] px-5 py-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                Sort By
              </h2>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                aria-label="Close sort options"
              >
                <X className="h-4 w-4 text-[#7E818C]" aria-hidden="true" />
              </button>
            </div>
            <div className="divide-y divide-[#EAEAEC]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    applyFilters({ ...filters, sort: opt.value });
                    setMobileSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-sm ${
                    filters.sort === opt.value
                      ? 'font-bold text-[#FF3F6C]'
                      : 'text-[#282C3F]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {filters.sort === opt.value && (
                    <span className="h-2 w-2 rounded-full bg-[#FF3F6C]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-[#282C3F]/60 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full flex-col rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(40,44,63,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-[#EAEAEC]" />
            <div className="flex items-center justify-between border-b border-[#EAEAEC] px-5 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X className="h-4 w-4 text-[#7E818C]" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterSidebar
                filters={draftFilters}
                onChange={setDraftFilters}
                onClearAll={() => setDraftFilters(DEFAULT_FILTERS)}
                availableCategories={availableCategories}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#EAEAEC] bg-white px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="rounded border border-[#EAEAEC] py-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters(draftFilters);
                  setMobileFilterOpen(false);
                }}
                className="rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
