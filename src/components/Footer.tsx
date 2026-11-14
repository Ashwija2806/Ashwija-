import { Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#EAEAEC] bg-[#F5F5F6] pb-20 md:pb-10">
      <div className="mx-auto max-w-[1440px] px-5 pt-12 pb-8 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Online Shopping
            </h3>
            <ul className="space-y-2 text-sm text-[#7E818C]">
              <li>
                <Link to="/shop/men" className="hover:text-[#282C3F]">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/shop/women" className="hover:text-[#282C3F]">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/shop/kids" className="hover:text-[#282C3F]">
                  Kids
                </Link>
              </li>
              <li>
                <Link to="/shop/home" className="hover:text-[#282C3F]">
                  Home &amp; Living
                </Link>
              </li>
              <li>
                <Link to="/shop/beauty" className="hover:text-[#282C3F]">
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Customer Policies
            </h3>
            <ul className="space-y-2 text-sm text-[#7E818C]">
              <li>
                <Link to="/orders" className="hover:text-[#282C3F]">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#282C3F]">
                  Manage Addresses
                </Link>
              </li>
              <li>
                <Link to="/bag" className="hover:text-[#282C3F]">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#282C3F]">
                  Available Coupons
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Curated Edits
            </h3>
            <ul className="space-y-2 text-sm text-[#7E818C]">
              <li>
                <Link to="/shop?sort=newest" className="hover:text-[#282C3F]">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=discount" className="hover:text-[#282C3F]">
                  Deal of the Day
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Footwear" className="hover:text-[#282C3F]">
                  Studio Footwear
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#282C3F]">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 space-y-4 md:col-span-1">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#282C3F]" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-[#7E818C]">
                <strong className="font-bold text-[#282C3F]">100% ORIGINAL</strong>{' '}
                guarantee for all products at Stylo.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-6 w-6 shrink-0 text-[#282C3F]" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-[#7E818C]">
                <strong className="font-bold text-[#282C3F]">Return within 14 days</strong>{' '}
                of receiving your order with doorstep pickup.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#EAEAEC] pt-6 text-xs text-[#7E818C] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Stylo Fashion Pvt. Ltd. All rights reserved.</p>
          <p>Free express delivery on orders above ₹999</p>
        </div>
      </div>
    </footer>
  );
}
