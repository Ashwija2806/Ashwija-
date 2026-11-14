import { useState } from 'react';
import { Search, Star, X } from 'lucide-react';
import { ALL_BRANDS, ALL_CATEGORIES, ALL_COLORS } from '../data/products';
import type { FilterState, Gender } from '../types';
import { formatINR } from '../utils/catalogLogic';

const GENDERS: Gender[] = ['Men', 'Women', 'Kids', 'Home', 'Beauty'];
const DISCOUNT_OPTIONS = [10, 20, 30, 40, 50];
const RATING_OPTIONS = [4.5, 4, 3.5];
const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', 'UK 7', 'UK 8', 'UK 9', '4-5Y', '6-7Y', 'Queen', '50 ml'];

const COLOR_SWATCH: Record<string, string> = {
  Olive: '#556B2F',
  Beige: '#D9C8B4',
  Charcoal: '#363945',
  Blue: '#2B5B84',
  Black: '#1C1E26',
  White: '#FFFFFF',
  Navy: '#1B2A4A',
  Green: '#2E6F5E',
  Terracotta: '#C2593F',
  Pink: '#E48A9D',
  Yellow: '#E2A832',
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClearAll: () => void;
  availableCategories?: string[];
  className?: string;
}

export function FilterSidebar({
  filters,
  onChange,
  onClearAll,
  availableCategories,
  className = '',
}: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');

  const categoriesToShow =
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : ALL_CATEGORIES;

  const filteredBrands = ALL_BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.trim().toLowerCase())
  );

  const toggleArrayValue = (key: 'categories' | 'brands' | 'colors' | 'sizes', val: string) => {
    const current = filters[key];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    onChange({ ...filters, [key]: next });
  };

  return (
    <aside aria-label="Product filters" className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#282C3F]">
          Filters
        </h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Department / Gender */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Department
        </h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]">
            <input
              type="radio"
              name="filter-gender"
              checked={filters.gender === ''}
              onChange={() => onChange({ ...filters, gender: '' })}
              className="h-4 w-4 accent-[#FF3F6C]"
            />
            <span>All Departments</span>
          </label>
          {GENDERS.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
            >
              <input
                type="radio"
                name="filter-gender"
                checked={filters.gender === g}
                onChange={() => onChange({ ...filters, gender: g })}
                className="h-4 w-4 accent-[#FF3F6C]"
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Categories
        </h3>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {categoriesToShow.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleArrayValue('categories', cat)}
                className="h-4 w-4 rounded-xs accent-[#FF3F6C]"
              />
              <span className="truncate">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Brand
        </h3>
        <div className="mb-2.5 flex items-center rounded border border-[#EAEAEC] bg-[#F5F5F6] px-2.5 py-1.5">
          <Search className="mr-2 h-3.5 w-3.5 text-[#7E818C]" aria-hidden="true" />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brand"
            aria-label="Filter brands by name"
            className="w-full bg-transparent text-xs text-[#282C3F] placeholder:text-[#7E818C] focus:outline-none"
          />
          {brandSearch && (
            <button
              type="button"
              onClick={() => setBrandSearch('')}
              aria-label="Clear brand search"
            >
              <X className="h-3 w-3 text-[#7E818C]" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {filteredBrands.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayValue('brands', brand)}
                className="h-4 w-4 rounded-xs accent-[#FF3F6C]"
              />
              <span className="truncate">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
            Max Price
          </h3>
          <span className="text-xs font-bold text-[#282C3F] tabular-nums">
            Up to {formatINR(filters.maxPrice)}
          </span>
        </div>
        <label htmlFor="price-range-slider" className="sr-only">
          Maximum price filter
        </label>
        <input
          id="price-range-slider"
          type="range"
          min={500}
          max={7000}
          step={100}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full cursor-pointer accent-[#FF3F6C]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-[#7E818C] tabular-nums">
          <span>₹500</span>
          <span>₹7,000</span>
        </div>
      </div>

      {/* Color */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Color
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ALL_COLORS.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleArrayValue('colors', color)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? 'border-[#FF3F6C] bg-[#FF3F6C]/5 font-bold text-[#282C3F]'
                    : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#7E818C]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#EAEAEC]"
                  style={{ backgroundColor: COLOR_SWATCH[color] || '#CCCCCC' }}
                />
                <span className="truncate">{color}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Size
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayValue('sizes', size)}
                aria-pressed={active}
                className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#282C3F] bg-[#282C3F] text-white'
                    : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#282C3F]'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount */}
      <div className="border-b border-[#EAEAEC] pb-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Discount Range
        </h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]">
            <input
              type="radio"
              name="filter-discount"
              checked={filters.minDiscount === 0}
              onChange={() => onChange({ ...filters, minDiscount: 0 })}
              className="h-4 w-4 accent-[#FF3F6C]"
            />
            <span>Any Discount</span>
          </label>
          {DISCOUNT_OPTIONS.map((pct) => (
            <label
              key={pct}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
            >
              <input
                type="radio"
                name="filter-discount"
                checked={filters.minDiscount === pct}
                onChange={() => onChange({ ...filters, minDiscount: pct })}
                className="h-4 w-4 accent-[#FF3F6C]"
              />
              <span>{pct}% and above</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pb-2">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
          Customer Rating
        </h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]">
            <input
              type="radio"
              name="filter-rating"
              checked={filters.minRating === 0}
              onChange={() => onChange({ ...filters, minRating: 0 })}
              className="h-4 w-4 accent-[#FF3F6C]"
            />
            <span>All Ratings</span>
          </label>
          {RATING_OPTIONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
            >
              <input
                type="radio"
                name="filter-rating"
                checked={filters.minRating === r}
                onChange={() => onChange({ ...filters, minRating: r })}
                className="h-4 w-4 accent-[#FF3F6C]"
              />
              <span className="inline-flex items-center gap-1 tabular-nums">
                {r}
                <Star className="h-3.5 w-3.5 fill-[#03A685] text-[#03A685]" aria-hidden="true" />
                &amp; above
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
