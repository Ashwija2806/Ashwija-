import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, RefreshCw, XCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProductImage } from '../components/ProductImage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import type { Order } from '../types';
import { formatINR } from '../utils/catalogLogic';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Want to change size or color',
  'Expected delivery time is too long',
  'Found a better offer elsewhere',
];

const RETURN_REASONS = [
  'Size does not fit as expected',
  'Style or color looked different',
  'Received damaged or defective item',
  'Quality did not meet expectations',
];

export function OrdersPage() {
  useDocumentTitle('My Orders', 'Track, cancel, or request returns on your Stylo orders.');

  const orders = useStore((s) => s.orders);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const requestOrderAction = useStore((s) => s.requestOrderAction);
  const showToast = useStore((s) => s.showToast);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const [returnTarget, setReturnTarget] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'Return Requested' | 'Exchange Requested'>(
    'Return Requested'
  );
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    cancelOrder(cancelTarget.id, cancelReason);
    showToast(`Order ${cancelTarget.id} cancelled`, 'info');
    setCancelTarget(null);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    requestOrderAction(returnTarget.id, returnType, returnReason);
    showToast(`${returnType} submitted for ${returnTarget.id}`, 'success');
    setReturnTarget(null);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6">
      <div className="mb-6 flex items-baseline justify-between border-b border-[#EAEAEC] pb-4">
        <h1 className="font-display text-xl font-bold text-[#282C3F] sm:text-2xl">
          My Orders
        </h1>
        <span className="text-xs text-[#7E818C] tabular-nums">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded border border-[#EAEAEC] bg-[#F5F5F6] px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-[#7E818C]" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg font-bold text-[#282C3F]">
            No Orders Yet
          </h2>
          <p className="mt-1.5 text-sm text-[#7E818C]">
            When you place an order on Stylo, you can track delivery and manage returns here.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isCancelled = order.status === 'Cancelled';
            const isReturned =
              order.status === 'Return Requested' ||
              order.status === 'Exchange Requested';

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded border border-[#EAEAEC] bg-white"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEC] bg-[#F5F5F6] px-4 py-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[#7E818C]">Order ID: </span>
                      <strong className="text-[#282C3F]">{order.id}</strong>
                    </div>
                    <div>
                      <span className="text-[#7E818C]">Total: </span>
                      <strong className="text-[#282C3F] tabular-nums">
                        {formatINR(order.finalAmount)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-bold ${
                        isCancelled
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : isReturned
                            ? 'bg-[#FF905A]/15 text-[#9c4413]'
                            : 'bg-[#03A685]/15 text-[#03A685]'
                      }`}
                    >
                      {order.status}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                      className="font-bold text-[#FF3F6C] hover:underline"
                    >
                      {isExpanded ? 'Hide Details' : 'Track & Details'}
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-[#EAEAEC] px-4">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <Link
                        to={`/product/${item.productId}`}
                        className="h-16 w-12 shrink-0 overflow-hidden rounded bg-[#F5F5F6]"
                      >
                        <ProductImage src={item.image} alt={item.name} />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-[#282C3F]">
                          {item.brand}
                        </p>
                        <Link
                          to={`/product/${item.productId}`}
                          className="block truncate text-sm text-[#7E818C] hover:text-[#282C3F]"
                        >
                          {item.name}
                        </Link>
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

                {/* Expanded Tracking Timeline + Actions */}
                {isExpanded && (
                  <div className="border-t border-[#EAEAEC] bg-white px-4 py-5 space-y-5">
                    <div>
                      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                        Tracking Timeline
                      </h2>
                      <ol className="space-y-3">
                        {order.timeline.map((event, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs">
                            <CheckCircle2
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                event.completed ? 'text-[#03A685]' : 'text-[#EAEAEC]'
                              }`}
                              aria-hidden="true"
                            />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-[#282C3F]">
                                  {event.status}
                                </span>
                                <span className="text-[#7E818C]">{event.timestamp}</span>
                              </div>
                              <p className="mt-0.5 text-[#7E818C]">{event.description}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-[#EAEAEC] pt-4 text-xs sm:grid-cols-2">
                      <div>
                        <p className="font-bold uppercase text-[#7E818C]">
                          Delivery Address
                        </p>
                        <p className="mt-1 font-semibold text-[#282C3F]">
                          {order.address.fullName} ({order.address.mobile})
                        </p>
                        <p className="text-[#7E818C]">
                          {order.address.addressLine}, {order.address.locality},{' '}
                          {order.address.city} — {order.address.pincode}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-[#7E818C]">
                          Payment Mode
                        </p>
                        <p className="mt-1 font-semibold text-[#282C3F]">
                          {order.paymentSummary}
                        </p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    {!isCancelled && !isReturned && (
                      <div className="flex flex-wrap gap-3 border-t border-[#EAEAEC] pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCancelReason(CANCEL_REASONS[0]);
                            setCancelTarget(order);
                          }}
                          className="inline-flex items-center gap-1.5 rounded border border-[#ba1a1a]/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Cancel Order
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReturnType('Return Requested');
                            setReturnReason(RETURN_REASONS[0]);
                            setReturnTarget(order);
                          }}
                          className="inline-flex items-center gap-1.5 rounded border border-[#282C3F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          Return / Exchange
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title={`Cancel Order ${cancelTarget?.id || ''}`}
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <p className="text-xs text-[#7E818C]">
            Select a reason for cancelling this order. Any prepaid amount will be refunded to your original payment source.
          </p>
          <div className="space-y-2">
            {CANCEL_REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  checked={cancelReason === r}
                  onChange={() => setCancelReason(r)}
                  className="accent-[#FF3F6C]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="rounded border border-[#EAEAEC] px-4 py-2 text-xs font-bold uppercase text-[#282C3F]"
            >
              Keep Order
            </button>
            <button
              type="submit"
              className="rounded bg-[#ba1a1a] px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Confirm Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Return / Exchange Modal */}
      <Modal
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title={`Return or Exchange — ${returnTarget?.id || ''}`}
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['Return Requested', 'Exchange Requested'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReturnType(type)}
                className={`rounded border py-2.5 text-xs font-bold uppercase ${
                  returnType === type
                    ? 'border-[#FF3F6C] bg-[#FF3F6C]/5 text-[#FF3F6C]'
                    : 'border-[#EAEAEC] text-[#282C3F]'
                }`}
              >
                {type === 'Return Requested' ? 'Return Item' : 'Exchange Size'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-[#7E818C]">
              Reason
            </p>
            {RETURN_REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-[#282C3F]"
              >
                <input
                  type="radio"
                  name="return-reason"
                  checked={returnReason === r}
                  onChange={() => setReturnReason(r)}
                  className="accent-[#FF3F6C]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Submit Request
          </button>
        </form>
      </Modal>
    </main>
  );
}
