import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Edit2, LogOut, MapPin, Package, Plus, Tag, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { COUPONS } from '../data/catalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStore } from '../store/useStore';
import type { Address } from '../types';

const EMPTY_ADDR: Omit<Address, 'id'> = {
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

export function ProfilePage() {
  useDocumentTitle('My Profile', 'Manage your Stylo profile, addresses, and coupons.');

  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const addresses = useStore((s) => s.addresses);
  const orders = useStore((s) => s.orders);
  const updateProfile = useStore((s) => s.updateProfile);
  const logout = useStore((s) => s.logout);
  const addAddress = useStore((s) => s.addAddress);
  const updateAddress = useStore((s) => s.updateAddress);
  const deleteAddress = useStore((s) => s.deleteAddress);
  const setDefaultAddress = useStore((s) => s.setDefaultAddress);
  const showToast = useStore((s) => s.showToast);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>(
    user?.gender || ''
  );

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>(EMPTY_ADDR);
  const [addrError, setAddrError] = useState('');

  if (!user) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      showToast('Please enter a valid name.', 'error');
      return;
    }
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      gender: gender || undefined,
    });
    showToast('Profile details saved', 'success');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addrForm.fullName.trim() ||
      !/^[6-9]\d{9}$/.test(addrForm.mobile.trim()) ||
      !/^[1-9]\d{5}$/.test(addrForm.pincode.trim()) ||
      !addrForm.addressLine.trim() ||
      !addrForm.locality.trim() ||
      !addrForm.city.trim() ||
      !addrForm.state.trim()
    ) {
      setAddrError('Please fill in all required address fields with valid mobile and pincode.');
      return;
    }
    setAddrError('');
    if (editingId) {
      updateAddress(editingId, addrForm);
      showToast('Address updated', 'success');
    } else {
      addAddress(addrForm);
      showToast('Address added', 'success');
    }
    setAddrModalOpen(false);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#EAEAEC] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#282C3F]">
            Account &amp; Profile
          </h1>
          <p className="mt-0.5 text-sm text-[#7E818C] tabular-nums">
            Signed in as +91 {user.mobile}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded border border-[#EAEAEC] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:border-[#282C3F]"
          >
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            My Orders ({orders.length})
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              showToast('Logged out of Stylo', 'info');
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 rounded border border-[#ba1a1a]/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#ba1a1a] hover:bg-[#ffdad6]/40"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Edit Profile Details */}
        <section
          aria-labelledby="profile-details-heading"
          className="rounded border border-[#EAEAEC] bg-white p-5 lg:col-span-5 h-fit"
        >
          <h2
            id="profile-details-heading"
            className="mb-4 font-display text-base font-bold text-[#282C3F]"
          >
            Personal Details
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label htmlFor="prof-name" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-email" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Email Address
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-gender" className="mb-1 block text-xs font-bold text-[#282C3F]">
                Gender Preference
              </label>
              <select
                id="prof-gender"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as 'Male' | 'Female' | 'Other' | '')
                }
                className="w-full rounded border border-[#EAEAEC] bg-white px-3 py-2 text-sm focus:border-[#282C3F] focus:outline-none"
              >
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-[#FF3F6C] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
            >
              Save Details
            </button>
          </form>
        </section>

        {/* Saved Addresses + Coupons */}
        <div className="space-y-8 lg:col-span-7">
          <section aria-labelledby="saved-addresses-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="saved-addresses-heading"
                className="flex items-center gap-2 font-display text-base font-bold text-[#282C3F]"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Saved Addresses
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setAddrForm(EMPTY_ADDR);
                  setAddrError('');
                  setAddrModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#FF3F6C] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add New
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start justify-between gap-3 rounded border border-[#EAEAEC] bg-white p-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#282C3F]">
                        {addr.fullName}
                      </span>
                      <span className="rounded bg-[#F5F5F6] px-2 py-0.5 text-[10px] font-bold uppercase text-[#7E818C]">
                        {addr.addressType}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[11px] font-bold text-[#03A685]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[#7E818C]">
                      {addr.addressLine}, {addr.locality}, {addr.city}, {addr.state} —{' '}
                      {addr.pincode}
                    </p>
                    <p className="mt-1 text-[#282C3F]">Mobile: {addr.mobile}</p>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          setDefaultAddress(addr.id);
                          showToast('Default address updated', 'info');
                        }}
                        className="mt-2 font-bold text-[#FF3F6C] hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(addr.id);
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
                        setAddrModalOpen(true);
                      }}
                      aria-label={`Edit address for ${addr.fullName}`}
                      className="rounded p-1.5 text-[#7E818C] hover:bg-[#F5F5F6] hover:text-[#282C3F]"
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteAddress(addr.id);
                        showToast('Address removed', 'info');
                      }}
                      aria-label={`Delete address for ${addr.fullName}`}
                      className="rounded p-1.5 text-[#7E818C] hover:bg-[#F5F5F6] hover:text-[#ba1a1a]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="profile-coupons-heading">
            <h2
              id="profile-coupons-heading"
              className="mb-3 flex items-center gap-2 font-display text-base font-bold text-[#282C3F]"
            >
              <Tag className="h-4 w-4" aria-hidden="true" />
              Available Coupons
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {COUPONS.map((c) => (
                <div
                  key={c.code}
                  className="flex flex-col justify-between rounded border border-[#EAEAEC] bg-[#F5F5F6] p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded border border-dashed border-[#FF3F6C] bg-white px-2.5 py-0.5 text-xs font-bold text-[#FF3F6C]">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(c.code);
                          showToast(`Copied ${c.code}`, 'info');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#282C3F] hover:text-[#FF3F6C]"
                      >
                        <Copy className="h-3 w-3" aria-hidden="true" />
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#282C3F]">{c.title}</p>
                    <p className="mt-0.5 text-xs text-[#7E818C]">{c.description}</p>
                  </div>
                  <p className="mt-2 text-[11px] text-[#7E818C]">
                    Valid till {c.expiryDate}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        open={addrModalOpen}
        onClose={() => setAddrModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add Address'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name *"
              aria-label="Full Name"
              value={addrForm.fullName}
              onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
            <input
              type="tel"
              maxLength={10}
              placeholder="Mobile *"
              aria-label="Mobile Number"
              value={addrForm.mobile}
              onChange={(e) =>
                setAddrForm({ ...addrForm, mobile: e.target.value.replace(/\D/g, '') })
              }
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              maxLength={6}
              placeholder="Pincode *"
              aria-label="Pincode"
              value={addrForm.pincode}
              onChange={(e) =>
                setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '') })
              }
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Locality *"
              aria-label="Locality"
              value={addrForm.locality}
              onChange={(e) => setAddrForm({ ...addrForm, locality: e.target.value })}
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Address Line *"
            aria-label="Address Line"
            value={addrForm.addressLine}
            onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
            className="w-full rounded border border-[#EAEAEC] px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City *"
              aria-label="City"
              value={addrForm.city}
              onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="State *"
              aria-label="State"
              value={addrForm.state}
              onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
              className="rounded border border-[#EAEAEC] px-3 py-2 text-sm"
            />
          </div>
          {addrError && (
            <p role="alert" className="text-xs font-semibold text-[#ba1a1a]">
              {addrError}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-[#FF3F6C] py-2.5 text-xs font-bold uppercase text-white"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </main>
  );
}
