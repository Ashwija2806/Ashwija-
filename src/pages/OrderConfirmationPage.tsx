import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck } from 'lucide-react';
import { ProductImage } from '../components/ProductImage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import { formatINR } from '../utils/catalogLogic';

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle('Order Confirmed', 'Your Stylo order has been confirmed.');

  const orders = useStore((s) => s.orders);
  const order = orders.find((o) => o.id === id) || orders[0];

  if (!order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-xl font-bold text-[#282C3F]">
          Order Not Found
        </h1>
        <Link
          to="/orders"
          className="mt-5 inline-block rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase text-white"
        >
          View All Orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24 sm:px-6">
      <div className="rounded-lg border border-[#EAEAEC] bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center border-b border-[#EAEAEC] pb-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#03A685]/15 text-[#03A685]">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#03A685]">
            Order Confirmed
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#282C3F]">
            Thank you for shopping with Stylo!
          </h1>
          <p className="mt-1.5 text-sm text-[#7E818C]">
            Order <strong className="text-[#282C3F]">{order.id}</strong> has been placed
            and is preparing for dispatch.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded bg-[#F5F5F6] px-4 py-2 text-xs font-semibold text-[#282C3F]">
            <Truck className="h-4 w-4 text-[#FF3F6C]" aria-hidden="true" />
            <span>Estimated Delivery by {order.estimatedDelivery}</span>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 gap-4 border-b border-[#EAEAEC] py-5 sm:grid-cols-2 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-[#7E818C]">
              Shipping Address
            </p>
            <p className="mt-1.5 font-bold text-sm text-[#282C3F]">
              {order.address.fullName}
            </p>
            <p className="mt-0.5 leading-relaxed text-[#7E818C]">
              {order.address.addressLine}, {order.address.locality},{' '}
              {order.address.city}, {order.address.state} — {order.address.pincode}
            </p>
            <p className="mt-0.5 text-[#282C3F]">Mobile: {order.address.mobile}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-[#7E818C]">
              Payment Summary
            </p>
            <p className="mt-1.5 font-bold text-sm text-[#282C3F]">
              {order.paymentSummary}
            </p>
            <p className="mt-1 text-xs text-[#7E818C] tabular-nums">
              Total Paid:{' '}
              <strong className="text-[#282C3F]">{formatINR(order.finalAmount)}</strong>
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-[#EAEAEC] py-2">
          {order.items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3 py-3"
            >
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-[#F5F5F6]">
                <ProductImage src={item.image} alt={item.name} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-[#282C3F]">
                  {item.brand}
                </p>
                <p className="truncate text-sm text-[#7E818C]">{item.name}</p>
                <p className="text-xs text-[#7E818C] tabular-nums">
                  Size: {item.size} · Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold text-[#282C3F] tabular-nums">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded border border-[#282C3F] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Track Order
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
