import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Clock,
  Heart,
  Home,
  LayoutGrid,
  Menu,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { MEGA_MENU_DATA, TRENDING_SEARCHES } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { useStore } from '../store/useStore';
import type { Gender } from '../types';
import { formatINR } from '../utils/catalogLogic';

const NAV_GENDERS: Gender[] = ['Men', 'Women', 'Kids', 'Home', 'Beauty'];

export function Header() {
  const navigate = useNavigate();
  const bag = useStore((s) => s.bag);
  const wishlist = useStore((s) => s.wishlist);
  const user = useStore((s) => s.user);
  const recentSearches = useStore((s) => s.recentSearches);
  const addRecentSearch = useStore((s) => s.addRecentSearch);
  const clearRecentSearches = useStore((s) => s.clearRecentSearches);

  const bagCount = bag.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchingProducts = trimmedQuery
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.brand.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery)
      ).slice(0, 5)
    : [];

  const matchingBrands = trimmedQuery
    ? Array.from(
        new Set(
          PRODUCTS.filter((p) => p.brand.toLowerCase().includes(trimmedQuery)).map(
            (p) => p.brand
          )
        )
      ).slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent, explicitQuery?: string) => {
    e.preventDefault();
    const q = (explicitQuery ?? searchQuery).trim();
    if (!q) return;
    addRecentSearch(q);
    setSearchFocused(false);
    setMobileSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const openMegaMenu = (gender: Gender) => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setHoveredGender(gender);
  };

  const closeMegaMenu = () => {
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredGender(null);
    }, 120);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#EAEAEC] bg-white shadow-[0_2px_8px_rgba(40,44,63,0.04)]">
        {/* Desktop & Mobile Top Row */}
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-20 md:gap-6 md:px-10">
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded text-[#282C3F] hover:bg-[#F5F5F6] md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3F6C]"
              aria-label="Stylo Home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-[#FF3F6C] font-display text-lg font-extrabold text-white">
                S
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-[#282C3F]">
                STYLO
              </span>
            </Link>
          </div>

          {/* Center-Left: Desktop Category Nav with Mega-Menu */}
          <nav
            aria-label="Primary categories"
            className="hidden h-full items-center gap-6 lg:gap-7 md:flex"
          >
            {NAV_GENDERS.map((gender) => (
              <div
                key={gender}
                className="relative flex h-full items-center"
                onMouseEnter={() => openMegaMenu(gender)}
                onMouseLeave={closeMegaMenu}
              >
                <NavLink
                  to={`/shop/${gender.toLowerCase()}`}
                  onFocus={() => openMegaMenu(gender)}
                  className={({ isActive }) =>
                    `relative flex h-full items-center text-[13px] font-bold uppercase tracking-[0.04em] whitespace-nowrap shrink-0 transition-colors ${
                      isActive || hoveredGender === gender
                        ? 'text-[#FF3F6C]'
                        : 'text-[#282C3F] hover:text-[#FF3F6C]'
                    }`
                  }
                >
                  {gender}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[3px] bg-[#FF3F6C] transition-transform duration-150 ${
                      hoveredGender === gender ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </NavLink>
              </div>
            ))}
          </nav>

          {/* Center: Desktop Live Search Bar */}
          <div
            ref={searchWrapperRef}
            className="relative hidden flex-1 max-w-md md:block"
          >
            <form onSubmit={handleSearchSubmit} role="search">
              <label htmlFor="desktop-search" className="sr-only">
                Search for products, brands and more
              </label>
              <div
                className={`flex items-center rounded border transition-all ${
                  searchFocused
                    ? 'border-[#EAEAEC] bg-white shadow-[0_4px_16px_rgba(40,44,63,0.08)]'
                    : 'border-transparent bg-[#F5F5F6]'
                }`}
              >
                <Search
                  className="ml-3.5 h-4 w-4 shrink-0 text-[#7E818C]"
                  aria-hidden="true"
                />
                <input
                  id="desktop-search"
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-[#282C3F] placeholder:text-[#7E818C] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search text"
                    className="mr-2 rounded p-1 text-[#7E818C] hover:text-[#282C3F]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Autosuggest & Recent Searches Dropdown */}
            {searchFocused && (
              <div className="absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded border border-[#EAEAEC] bg-white shadow-[0_8px_24px_rgba(40,44,63,0.12)]">
                {trimmedQuery ? (
                  <div className="divide-y divide-[#EAEAEC]">
                    {matchingBrands.length > 0 && (
                      <div className="p-3">
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                          Brands
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingBrands.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => {
                                addRecentSearch(brand);
                                setSearchFocused(false);
                                navigate(`/shop?brand=${encodeURIComponent(brand)}`);
                              }}
                              className="rounded border border-[#EAEAEC] bg-[#F5F5F6] px-2.5 py-1 text-xs font-semibold text-[#282C3F] hover:border-[#FF3F6C] hover:text-[#FF3F6C]"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                        Products
                      </p>
                      {matchingProducts.length > 0 ? (
                        <ul>
                          {matchingProducts.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  addRecentSearch(item.name);
                                  setSearchFocused(false);
                                  navigate(`/product/${item.id}`);
                                }}
                                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-[#F5F5F6]"
                              >
                                <img
                                  src={item.images[0]}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="h-10 w-8 rounded object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-bold uppercase text-[#282C3F]">
                                    {item.brand}
                                  </p>
                                  <p className="truncate text-xs text-[#7E818C]">
                                    {item.name}
                                  </p>
                                </div>
                                <span className="text-xs font-bold text-[#282C3F] tabular-nums">
                                  {formatINR(item.price)}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-2 py-3 text-xs text-[#7E818C]">
                          No quick matches. Press Enter to search all products.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                            Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF3F6C] hover:underline"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={(e) => handleSearchSubmit(e, term)}
                              className="inline-flex items-center gap-1 rounded border border-[#EAEAEC] px-2.5 py-1 text-xs text-[#282C3F] hover:border-[#282C3F]"
                            >
                              <Clock className="h-3 w-3 text-[#7E818C]" aria-hidden="true" />
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                        Trending Searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.slice(0, 6).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={(e) => handleSearchSubmit(e, term)}
                            className="rounded bg-[#F5F5F6] px-2.5 py-1 text-xs font-medium text-[#282C3F] hover:bg-[#FF3F6C]/10 hover:text-[#FF3F6C]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Action Icons (Profile, Wishlist, Bag) */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Toggle mobile search"
              className="flex h-10 w-10 items-center justify-center rounded text-[#282C3F] hover:bg-[#F5F5F6] md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              to={user ? '/profile' : '/login'}
              className="hidden flex-col items-center gap-0.5 text-[#282C3F] transition-colors hover:text-[#FF3F6C] md:flex whitespace-nowrap shrink-0"
              aria-label={user ? `Profile (${user.name})` : 'Login or Profile'}
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-bold">
                {user ? user.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>

            <Link
              to="/wishlist"
              className="relative flex flex-col items-center gap-0.5 text-[#282C3F] transition-colors hover:text-[#FF3F6C] whitespace-nowrap shrink-0"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              <span className="hidden text-[11px] font-bold md:block">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3F6C] px-1 text-[10px] font-bold text-white tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/bag"
              className="relative flex flex-col items-center gap-0.5 text-[#282C3F] transition-colors hover:text-[#FF3F6C] whitespace-nowrap shrink-0"
              aria-label={`Shopping Bag (${bagCount} items)`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="hidden text-[11px] font-bold md:block">Bag</span>
              {bagCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3F6C] px-1 text-[10px] font-bold text-white tabular-nums">
                  {bagCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Expandable Search Row */}
        {mobileSearchOpen && (
          <div className="border-t border-[#EAEAEC] bg-white px-4 py-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded border border-[#EAEAEC] bg-[#F5F5F6] px-3">
                <Search className="h-4 w-4 text-[#7E818C]" aria-hidden="true" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search outfits, brands, categories..."
                  className="w-full bg-transparent px-2.5 py-2 text-sm text-[#282C3F] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded bg-[#FF3F6C] px-3.5 py-2 text-xs font-bold uppercase text-white"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Desktop Mega-Menu Panel */}
        {hoveredGender && (
          <div
            onMouseEnter={() => openMegaMenu(hoveredGender)}
            onMouseLeave={closeMegaMenu}
            className="absolute inset-x-0 top-full z-40 hidden border-b border-[#EAEAEC] bg-white shadow-[0_8px_24px_rgba(40,44,63,0.12)] md:block"
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-8 px-10 py-6">
              {MEGA_MENU_DATA[hoveredGender].columns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#FF3F6C]">
                    {col.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={`/shop/${hoveredGender.toLowerCase()}?${item.query}`}
                          onClick={() => setHoveredGender(null)}
                          className="text-sm text-[#282C3F] transition-colors hover:font-semibold hover:text-[#FF3F6C]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex flex-col justify-between rounded bg-[#F5F5F6] p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7E818C]">
                    Curated For You
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-[#282C3F]">
                    Explore All {hoveredGender}
                  </p>
                  <p className="mt-1 text-xs text-[#7E818C]">
                    Discover new arrivals, top-rated staples, and seasonal edits.
                  </p>
                </div>
                <Link
                  to={`/shop/${hoveredGender.toLowerCase()}`}
                  onClick={() => setHoveredGender(null)}
                  className="mt-4 inline-flex w-fit items-center rounded bg-[#282C3F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3F6C]"
                >
                  Shop {hoveredGender}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Hamburger Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="fixed inset-0 bg-[#282C3F]/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EAEAEC] bg-[#FF3F6C] px-5 py-4 text-white">
              <div>
                <p className="font-display text-base font-extrabold">
                  {user ? `Hi, ${user.name}` : 'Welcome to Stylo'}
                </p>
                <p className="text-xs text-white/90">
                  {user ? `+91 ${user.mobile}` : 'Sign in for faster checkout'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="rounded p-1 text-white hover:bg-white/15"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Shop By Department
                </p>
                <ul className="space-y-1">
                  {NAV_GENDERS.map((gender) => (
                    <li key={gender}>
                      <Link
                        to={`/shop/${gender.toLowerCase()}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-[#282C3F] hover:bg-[#F5F5F6] hover:text-[#FF3F6C]"
                      >
                        {gender}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-[#282C3F] hover:bg-[#F5F5F6] hover:text-[#FF3F6C]"
                    >
                      All Products
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#EAEAEC] pt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Your Account
                </p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link
                      to={user ? '/profile' : '/login'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded px-3 py-2 text-[#282C3F] hover:bg-[#F5F5F6]"
                    >
                      {user ? 'My Profile' : 'Sign In / Sign Up'}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded px-3 py-2 text-[#282C3F] hover:bg-[#F5F5F6]"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded px-3 py-2 text-[#282C3F] hover:bg-[#F5F5F6]"
                    >
                      Wishlist ({wishlistCount})
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-[#EAEAEC] bg-white shadow-[0_-4px_20px_rgba(40,44,63,0.08)] md:hidden"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[#FF3F6C]' : 'text-[#7E818C]'
            }`
          }
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[#FF3F6C]' : 'text-[#7E818C]'
            }`
          }
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          <span>Shop</span>
        </NavLink>
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[#FF3F6C]' : 'text-[#7E818C]'
            }`
          }
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
          <span>Wishlist</span>
        </NavLink>
        <NavLink
          to="/bag"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[#FF3F6C]' : 'text-[#7E818C]'
            }`
          }
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          <span>Bag{bagCount > 0 ? ` (${bagCount})` : ''}</span>
        </NavLink>
        <NavLink
          to={user ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive ? 'text-[#FF3F6C]' : 'text-[#7E818C]'
            }`
          }
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>{user ? 'Account' : 'Login'}</span>
        </NavLink>
      </nav>
    </>
  );
}
