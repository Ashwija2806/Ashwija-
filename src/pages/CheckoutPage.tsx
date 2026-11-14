import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  CreditCard,
  Edit2,
  Landmark,
  MapPin,
  Plus,
  Smartphone,
  Trash2,
  Truck,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProductImage } from '../components/ProductImage';
import { COUPONS } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import type { Address, PaymentMethod } from '../types';
import {
  calculateBagTotals,
  formatINR,
  validateCardDetails,
} from '../utils/catalogLogic';

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
  fullName: '',
  mobile: '',
  pincode: '',
  addressLine: '',
  locality: '',
  city: '',
  state: '',
  addressType: 'Home',
  isDefault: false,
};

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'];

export function CheckoutPage() {
  useDocumentTitle('Checkout', 'Complete your Stylo order securely.');

  const navigate = useNavigate();
  const bag = useStore((s) => s.bag);
  const appliedCouponCode = useStore((s) => s.appliedCouponCode);
  const addresses = useStore((s) => s.addresses);
  const addAddress = useStore((s) => s.addAddress);
  const updateAddress = useStore((s) => s.updateAddress);
  const deleteAddress = useStore((s) => s.deleteAddress);
  const placeOrder = useStore((s) => s.placeOrder);
  const showToast = useStore((s) => s.showToast);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr?.id || ''
  );

  // Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>(EMPTY_ADDRESS);
  const [addrError, setAddrError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [paymentError, setPaymentError] = useState('');

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

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;

  if (enrichedItems.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-xl font-bold text-[#282C3F]">
          Your bag is empty
        </h1>
        <p className="mt-2 text-sm text-[#7E818C]">
          Add items to your bag before checking out.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded bg-[#FF3F6C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
        >
          Shop Collection
        </Link>
      </main>
    );
  }

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddrForm(EMPTY_ADDRESS);
    setAddrError('');
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      fullName: addr.fullName,
      mobile: addr.mobile,
      pincode: addr.pincode,
      addressLine: addr.addressLine,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setAddrError('');
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrForm.fullName.trim().length < 2) {
      setAddrError('Please enter a valid full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(addrForm.mobile.trim())) {
      setAddrError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(addrForm.pincode.trim())) {
      setAddrError('Enter a valid 6-digit pincode.');
      return;
    }
    if (
      !addrForm.addressLine.trim() ||
      !addrForm.locality.trim() ||
      !addrForm.city.trim() ||
      !addrForm.state.trim()
    ) {
      setAddrError('Please fill in all address, locality, city, and state fields.');
      return;
    }

    setAddrError('');
    if (editingAddressId) {
      updateAddress(editingAddressId, addrForm);
      setSelectedAddressId(editingAddressId);
      showToast('Address updated', 'success');
    } else {
      const created = addAddress(addrForm);
      setSelectedAddressId(created.id);
      showToast('Address added', 'success');
    }
    setAddressModalOpen(false);
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      showToast('Please add and select a delivery address.', 'error');
      return;
    }
    setStep(2);
  };

  const handleContinueToSummary = () => {
    setPaymentError('');
    if (paymentMethod === 'UPI') {
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setPaymentError('Enter a valid UPI ID (e.g. name@okicici).');
        return;
      }
    } else if (paymentMethod === 'CARD') {
      const cardErr = validateCardDetails(cardForm);
      if (cardErr) {
        setPaymentError(cardErr);
        return;
      }
    }
    setStep(3);
  };

  const getPaymentSummary = (): string => {
    if (paymentMethod === 'UPI') return `UPI (${upiId.trim()})`;
    if (paymentMethod === 'CARD') {
      const last4 = cardForm.number.replace(/\s+/g, '').slice(-4);
      return `Card ending in •••• ${last4}`;
    }
    if (paymentMethod === 'NETBANKING') return `Net Banking (${selectedBank})`;
    return 'Cash on Delivery';
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;
    const order = placeOrder({
      items: enrichedItems.map(({ item, product }) => ({
        productId: product.id,
        brand: product.brand,
        name: product.name,
        image: product.images[0],
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.price,
        mrp: product.mrp,
      })),
      address: selectedAddress,
      paymentMethod,
      paymentSummary: getPaymentSummary(),
      couponCode: appliedCouponCode,
      totalMrp: totals.totalMrp,
      discountOnMrp: totals.discountOnMrp,
      couponDiscount: totals.couponDiscount,
      deliveryFee: totals.deliveryFee,
      platformFee: totals.platformFee,
      finalAmount: totals.finalAmount,
    });
    showToast('Order placed successfully!', 'success');
    navigate(`/order-confirmation/${order.id}`, { replace: true });
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 pb-24 sm:px-6 md:px-10">
      {/* 3-Step Indicator */}
      <nav aria-label="Checkout progress" className="mb-8 border-b border-[#EAEAEC] pb-5">
        <ol className="flex items-center justify-center gap-3 sm:gap-8">
          {[
            { num: 1 as const, label: 'Address' },
            { num: 2 as const, label: 'Payment' },
            { num: 3 as const, label: 'Summary' },
          ].map((s, idx) => {
            const active = step === s.num;
            const done = step > s.num;
            return (
              <li key={s.num} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={s.num > step}
                  onClick={() => s.num < step && setStep(s.num)}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    active
                      ? 'text-[#FF3F6C]'
                      : done
                        ? 'text-[#03A685]'
                        : 'text-[#7E818C]'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      active
                        ? 'bg-[#FF3F6C] text-white'
                        : done
                          ? 'bg-[#03A685] text-white'
                          : 'border border-[#EAEAEC] bg-[#F5F5F6] text-[#7E818C]'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < 2 && (
                  <span className="h-px w-8 bg-[#EAEAEC] sm:w-16" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Main Step Content */}
        <div className="lg:col-span-8">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <section aria-labelledby="step-address-heading" className="space-y-4">
              <div className="flex items-center justify-between">
                <h1
                  id="step-address-heading"
                  className="font-display text-lg font-bold text-[#282C3F]"
                >
                  Select Delivery Address
                </h1>
                <button
                  type="button"
                  onClick={openAddAddress}
                  className="inline-flex items-center gap-1.5 rounded border border-[#282C3F] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded border border-[#EAEAEC] bg-[#F5F5F6] p-8 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-[#7E818C]" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-[#282C3F]">
                    No saved addresses yet
                  </p>
                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="mt-4 rounded bg-[#FF3F6C] px-5 py-2.5 text-xs font-bold uppercase text-white"
                  >
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const selected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        className={`rounded border p-4 transition-colors ${
                          selected
                            ? 'border-[#FF3F6C] bg-[#FF3F6C]/[0.02]'
                            : 'border-[#EAEAEC] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex flex-1 cursor-pointer items-start gap-3">
                            <input
                              type="radio"
                              name="checkout-address"
                              checked={selected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 h-4 w-4 accent-[#FF3F6C]"
                            />
                            <div className="text-sm">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-[#282C3F]">
                                  {addr.fullName}
                                </span>
                                <span className="rounded border border-[#EAEAEC] bg-[#F5F5F6] px-2 py-0.5 text-[10px] font-bold uppercase text-[#7E818C]">
                                  {addr.addressType}
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-[#7E818C]">
                                {addr.addressLine}, {addr.locality}, {addr.city},{' '}
                                {addr.state} — <strong className="text-[#282C3F]">{addr.pincode}</strong>
                              </p>
                              <p className="mt-1 text-xs text-[#282C3F] tabular-nums">
                                Mobile: <strong>{addr.mobile}</strong>
                              </p>
                            </div>
                          </label>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditAddress(addr)}
                              aria-label={`Edit address for ${addr.fullName}`}
                              className="rounded p-1.5 text-[#7E818C] hover:bg-[#F5F5F6] hover:text-[#282C3F]"
                            >
                              <Edit2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteAddress(addr.id);
                                showToast('Address deleted', 'info');
                              }}
                              aria-label={`Delete address for ${addr.fullName}`}
                              className="rounded p-1.5 text-[#7E818C] hover:bg-[#F5F5F6] hover:text-[#ba1a1a]"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="w-full rounded bg-[#FF3F6C] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59] sm:w-auto sm:px-10"
                >
                  Continue to Payment
                </button>
              </div>
            </section>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <section aria-labelledby="step-payment-heading" className="space-y-5">
              <h1
                id="step-payment-heading"
                className="font-display text-lg font-bold text-[#282C3F]"
              >
                Choose Payment Mode
              </h1>

              <div className="space-y-3">
                {/* UPI */}
                <div
                  className={`rounded border p-4 ${
                    paymentMethod === 'UPI' ? 'border-[#FF3F6C]' : 'border-[#EAEAEC]'
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => {
                        setPaymentMethod('UPI');
                        setPaymentError('');
                      }}
                      className="h-4 w-4 accent-[#FF3F6C]"
                    />
                    <Smartphone className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#282C3F]">
                      UPI (GPay, PhonePe, Paytm)
                    </span>
                  </label>
                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pl-7">
                      <label htmlFor="upi-id" className="mb-1 block text-xs text-[#7E818C]">
                        Enter UPI ID
                      </label>
                      <input
                        id="upi-id"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. aarav@okicici"
                        className="w-full max-w-xs rounded border border-[#EAEAEC] px-3 py-2 text-sm text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div
                  className={`rounded border p-4 ${
                    paymentMethod === 'CARD' ? 'border-[#FF3F6C]' : 'border-[#EAEAEC]'
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => {
                        setPaymentMethod('CARD');
                        setPaymentError('');
                      }}
                      className="h-4 w-4 accent-[#FF3F6C]"
                    />
                    <CreditCard className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#282C3F]">
                      Credit / Debit Card
                    </span>
                  </label>
                  {paymentMethod === 'CARD' && (
                    <div className="mt-3 grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="card-num" className="mb-1 block text-xs text-[#7E818C]">
                          Card Number (16 digits)
                        </label>
                        <input
                          id="card-num"
                          type="text"
                          maxLength={19}
                          value={cardForm.number}
                          onChange={(e) =>
                            setCardForm({ ...cardForm, number: e.target.value })
                          }
                          placeholder="4111 2222 3333 4444"
                          className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm tabular-nums focus:border-[#282C3F] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="card-name" className="mb-1 block text-xs text-[#7E818C]">
                          Name on Card
                        </label>
                        <input
                          id="card-name"
                          type="text"
                          value={cardForm.name}
                          onChange={(e) =>
                            setCardForm({ ...cardForm, name: e.target.value })
                          }
                          placeholder="Aarav Mehta"
                          className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-exp" className="mb-1 block text-xs text-[#7E818C]">
                          Expiry (MM/YY)
                        </label>
                        <input
                          id="card-exp"
                          type="text"
                          maxLength={5}
                          value={cardForm.expiry}
                          onChange={(e) =>
                            setCardForm({ ...cardForm, expiry: e.target.value })
                          }
                          placeholder="12/28"
                          className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm tabular-nums focus:border-[#282C3F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv" className="mb-1 block text-xs text-[#7E818C]">
                          CVV
                        </label>
                        <input
                          id="card-cvv"
                          type="password"
                          maxLength={4}
                          value={cardForm.cvv}
                          onChange={(e) =>
                            setCardForm({
                              ...cardForm,
                              cvv: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          placeholder="123"
                          className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm tabular-nums focus:border-[#282C3F] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Net Banking */}
                <div
                  className={`rounded border p-4 ${
                    paymentMethod === 'NETBANKING' ? 'border-[#FF3F6C]' : 'border-[#EAEAEC]'
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'NETBANKING'}
                      onChange={() => {
                        setPaymentMethod('NETBANKING');
                        setPaymentError('');
                      }}
                      className="h-4 w-4 accent-[#FF3F6C]"
                    />
                    <Landmark className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#282C3F]">
                      Net Banking
                    </span>
                  </label>
                  {paymentMethod === 'NETBANKING' && (
                    <div className="mt-3 pl-7">
                      <label htmlFor="bank-select" className="mb-1 block text-xs text-[#7E818C]">
                        Select Bank
                      </label>
                      <select
                        id="bank-select"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full max-w-xs rounded border border-[#EAEAEC] bg-white px-3 py-2 text-sm text-[#282C3F] focus:border-[#282C3F] focus:outline-none"
                      >
                        {BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  className={`rounded border p-4 ${
                    paymentMethod === 'COD' ? 'border-[#FF3F6C]' : 'border-[#EAEAEC]'
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'COD'}
                      onChange={() => {
                        setPaymentMethod('COD');
                        setPaymentError('');
                      }}
                      className="h-4 w-4 accent-[#FF3F6C]"
                    />
                    <Truck className="h-4 w-4 text-[#282C3F]" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#282C3F]">
                      Cash on Delivery (Pay via Cash or UPI at doorstep)
                    </span>
                  </label>
                </div>
              </div>

              {paymentError && (
                <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
                  {paymentError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded border border-[#EAEAEC] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleContinueToSummary}
                  className="rounded bg-[#FF3F6C] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
                >
                  Review Order
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: SUMMARY */}
          {step === 3 && selectedAddress && (
            <section aria-labelledby="step-summary-heading" className="space-y-5">
              <h1
                id="step-summary-heading"
                className="font-display text-lg font-bold text-[#282C3F]"
              >
                Review &amp; Place Order
              </h1>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded border border-[#EAEAEC] p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[#7E818C]">
                      Delivering To
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-bold text-[#FF3F6C] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="mt-2 font-bold text-sm text-[#282C3F]">
                    {selectedAddress.fullName}
                  </p>
                  <p className="mt-1 leading-relaxed text-[#7E818C]">
                    {selectedAddress.addressLine}, {selectedAddress.locality},{' '}
                    {selectedAddress.city}, {selectedAddress.state} —{' '}
                    {selectedAddress.pincode}
                  </p>
                  <p className="mt-1 text-[#282C3F]">
                    Mobile: {selectedAddress.mobile}
                  </p>
                </div>

                <div className="rounded border border-[#EAEAEC] p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[#7E818C]">
                      Payment Method
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="font-bold text-[#FF3F6C] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="mt-2 font-bold text-sm text-[#282C3F]">
                    {getPaymentSummary()}
                  </p>
                  <p className="mt-1 text-[#03A685] font-medium">
                    100% Secure Transaction
                  </p>
                </div>
              </div>

              <div className="rounded border border-[#EAEAEC] divide-y divide-[#EAEAEC]">
                {enrichedItems.map(({ item, product }) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center gap-3 p-3.5"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-[#F5F5F6]">
                      <ProductImage src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase text-[#282C3F]">
                        {product.brand}
                      </p>
                      <p className="truncate text-sm text-[#7E818C]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#7E818C] tabular-nums">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#282C3F] tabular-nums">
                      {formatINR(product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded border border-[#EAEAEC] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#282C3F]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="flex-1 rounded bg-[#FF3F6C] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59] sm:flex-none sm:px-12"
                >
                  Place Order ({formatINR(totals.finalAmount)})
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right: Persistent Price Summary */}
        <aside className="lg:col-span-4">
          <div className="rounded border border-[#EAEAEC] bg-[#F5F5F6] p-5 lg:sticky lg:top-24">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Order Summary ({totals.itemCount} items)
            </h2>
            <dl className="space-y-2 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-[#7E818C]">Total MRP</dt>
                <dd>{formatINR(totals.totalMrp)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7E818C]">Discount on MRP</dt>
                <dd className="text-[#03A685]">−{formatINR(totals.discountOnMrp)}</dd>
              </div>
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[#7E818C]">Coupon ({appliedCouponCode})</dt>
                  <dd className="text-[#03A685]">−{formatINR(totals.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#7E818C]">Platform Fee</dt>
                <dd>{formatINR(totals.platformFee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#7E818C]">Delivery</dt>
                <dd className={totals.deliveryFee === 0 ? 'text-[#03A685] font-semibold' : ''}>
                  {totals.deliveryFee === 0 ? 'FREE' : formatINR(totals.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[#EAEAEC] pt-3 text-base font-bold text-[#282C3F]">
                <dt>Total Payable</dt>
                <dd>{formatINR(totals.finalAmount)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Add / Edit Address Modal */}
      <Modal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="addr-name" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Full Name *
              </label>
              <input
                id="addr-name"
                type="text"
                value={addrForm.fullName}
                onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="addr-mobile" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Mobile Number *
              </label>
              <input
                id="addr-mobile"
                type="tel"
                maxLength={10}
                value={addrForm.mobile}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, mobile: e.target.value.replace(/\D/g, '') })
                }
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm tabular-nums focus:border-[#282C3F] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="addr-pin" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Pincode *
              </label>
              <input
                id="addr-pin"
                type="text"
                maxLength={6}
                value={addrForm.pincode}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '') })
                }
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm tabular-nums focus:border-[#282C3F] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="addr-locality" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Locality / Area *
              </label>
              <input
                id="addr-locality"
                type="text"
                value={addrForm.locality}
                onChange={(e) => setAddrForm({ ...addrForm, locality: e.target.value })}
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="addr-line" className="mb-1 block text-xs font-bold text-[#282C3F]">
              Address (House No, Building, Street) *
            </label>
            <input
              id="addr-line"
              type="text"
              value={addrForm.addressLine}
              onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
              className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="addr-city" className="mb-1 block text-xs font-bold text-[#282C3F]">
                City *
              </label>
              <input
                id="addr-city"
                type="text"
                value={addrForm.city}
                onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="addr-state" className="mb-1 block text-xs font-bold text-[#282C3F]">
                State *
              </label>
              <input
                id="addr-state"
                type="text"
                value={addrForm.state}
                onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {(['Home', 'Work'] as const).map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#282C3F]">
                <input
                  type="radio"
                  name="addr-type"
                  checked={addrForm.addressType === t}
                  onChange={() => setAddrForm({ ...addrForm, addressType: t })}
                  className="accent-[#FF3F6C]"
                />
                {t}
              </label>
            ))}
          </div>

          {addrError && (
            <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
              {addrError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded bg-[#FF3F6C] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </main>
  );
}
