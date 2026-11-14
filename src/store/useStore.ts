import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Address,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ProductReview,
  ToastMessage,
  User,
} from '../types';

interface PlaceOrderPayload {
  items: OrderItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  paymentSummary: string;
  couponCode: string | null;
  totalMrp: number;
  discountOnMrp: number;
  couponDiscount: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
}

interface StyloState {
  bag: CartItem[];
  wishlist: string[];
  appliedCouponCode: string | null;
  user: User | null;
  addresses: Address[];
  orders: Order[];
  recentSearches: string[];
  recentlyViewed: string[];
  productReviews: Record<string, ProductReview[]>;
  toasts: ToastMessage[];

  // Bag actions
  addToBag: (item: CartItem) => void;
  removeFromBag: (productId: string, size: string) => void;
  updateBagItemQuantity: (productId: string, size: string, quantity: number) => void;
  updateBagItemSize: (productId: string, oldSize: string, newSize: string) => void;
  clearBag: () => void;

  // Wishlist actions
  toggleWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToBag: (productId: string, size: string, color: string) => void;

  // Coupon actions
  applyCouponCode: (code: string | null) => void;

  // Auth & Profile actions
  loginWithOtp: (mobile: string, name?: string) => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'gender'>>) => void;
  logout: () => void;

  // Address actions
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, updates: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Order actions
  placeOrder: (payload: PlaceOrderPayload) => Order;
  cancelOrder: (orderId: string, reason: string) => void;
  requestOrderAction: (orderId: string, type: 'Return Requested' | 'Exchange Requested', reason: string) => void;

  // Discovery & Reviews
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  trackProductView: (productId: string) => void;
  addProductReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => void;

  // Toasts
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-default-1',
    fullName: 'Aarav Mehta',
    mobile: '9876543210',
    pincode: '560038',
    addressLine: '42, 12th Main Road, HAL 2nd Stage',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    addressType: 'Home',
    isDefault: true,
  },
];

export const useStore = create<StyloState>()(
  persist(
    (set, get) => ({
      bag: [],
      wishlist: [],
      appliedCouponCode: null,
      user: null,
      addresses: DEFAULT_ADDRESSES,
      orders: [],
      recentSearches: [],
      recentlyViewed: [],
      productReviews: {},
      toasts: [],

      addToBag: (item) => {
        const current = get().bag;
        const existingIdx = current.findIndex(
          (i) => i.productId === item.productId && i.size === item.size
        );
        if (existingIdx >= 0) {
          const updated = [...current];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: Math.min(10, updated[existingIdx].quantity + item.quantity),
          };
          set({ bag: updated });
        } else {
          set({ bag: [...current, item] });
        }
      },

      removeFromBag: (productId, size) => {
        set((state) => ({
          bag: state.bag.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
      },

      updateBagItemQuantity: (productId, size, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          bag: state.bag.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: Math.min(10, quantity) }
              : i
          ),
        }));
      },

      updateBagItemSize: (productId, oldSize, newSize) => {
        if (oldSize === newSize) return;
        set((state) => {
          const target = state.bag.find(
            (i) => i.productId === productId && i.size === oldSize
          );
          if (!target) return state;

          const alreadyHasNewSize = state.bag.find(
            (i) => i.productId === productId && i.size === newSize
          );
          if (alreadyHasNewSize) {
            return {
              bag: state.bag
                .filter((i) => !(i.productId === productId && i.size === oldSize))
                .map((i) =>
                  i.productId === productId && i.size === newSize
                    ? { ...i, quantity: Math.min(10, i.quantity + target.quantity) }
                    : i
                ),
            };
          }

          return {
            bag: state.bag.map((i) =>
              i.productId === productId && i.size === oldSize
                ? { ...i, size: newSize }
                : i
            ),
          };
        });
      },

      clearBag: () => set({ bag: [], appliedCouponCode: null }),

      toggleWishlist: (productId) => {
        const exists = get().wishlist.includes(productId);
        if (exists) {
          set((state) => ({
            wishlist: state.wishlist.filter((id) => id !== productId),
          }));
          return false;
        }
        set((state) => ({
          wishlist: [productId, ...state.wishlist],
        }));
        return true;
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((id) => id !== productId),
        }));
      },

      moveWishlistToBag: (productId, size, color) => {
        get().addToBag({ productId, size, color, quantity: 1 });
        get().removeFromWishlist(productId);
      },

      applyCouponCode: (code) => set({ appliedCouponCode: code }),

      loginWithOtp: (mobile, name) => {
        const existingUser = get().user;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        set({
          user: {
            id: existingUser?.id || `usr-${cleanMobile}`,
            name: name?.trim() || existingUser?.name || `Stylo Member`,
            mobile: cleanMobile,
            email: existingUser?.email || '',
            gender: existingUser?.gender,
            joinedAt: existingUser?.joinedAt || new Date().toISOString(),
          },
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      logout: () => set({ user: null }),

      addAddress: (address) => {
        const newAddr: Address = {
          ...address,
          id: `addr-${Date.now()}`,
        };
        set((state) => {
          const shouldBeDefault = address.isDefault || state.addresses.length === 0;
          const prev = shouldBeDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.addresses;
          return { addresses: [{ ...newAddr, isDefault: shouldBeDefault }, ...prev] };
        });
        return newAddr;
      },

      updateAddress: (id, updates) => {
        set((state) => {
          const list = state.addresses.map((a) => {
            if (a.id === id) return { ...updates, id };
            return updates.isDefault ? { ...a, isDefault: false } : a;
          });
          return { addresses: list };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
            filtered[0] = { ...filtered[0], isDefault: true };
          }
          return { addresses: filtered };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      placeOrder: (payload) => {
        const now = new Date();
        const delivery = new Date(now);
        delivery.setDate(delivery.getDate() + 3);

        const orderId = `STY-${Math.floor(100000 + Math.random() * 900000)}`;
        const nowLabel = now.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        const estLabel = delivery.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });

        const order: Order = {
          id: orderId,
          createdAt: now.toISOString(),
          estimatedDelivery: estLabel,
          status: 'Confirmed',
          ...payload,
          timeline: [
            {
              status: 'Confirmed',
              description: 'Order placed and verified by Stylo Fulfillment.',
              timestamp: nowLabel,
              completed: true,
            },
            {
              status: 'Packed',
              description: 'Items quality-checked and packed at warehouse.',
              timestamp: 'Expected within 12 hrs',
              completed: false,
            },
            {
              status: 'Shipped',
              description: 'Handed over to express courier partner.',
              timestamp: 'Expected in 1 day',
              completed: false,
            },
            {
              status: 'Delivered',
              description: `Estimated arrival by ${estLabel}.`,
              timestamp: estLabel,
              completed: false,
            },
          ],
        };

        set((state) => ({
          orders: [order, ...state.orders],
          bag: [],
          appliedCouponCode: null,
        }));
        return order;
      },

      cancelOrder: (orderId, reason) => {
        const nowLabel = new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              status: 'Cancelled' as OrderStatus,
              cancelReason: reason,
              timeline: [
                ...order.timeline.filter((t) => t.completed),
                {
                  status: 'Cancelled',
                  description: `Order cancelled: ${reason}`,
                  timestamp: nowLabel,
                  completed: true,
                },
              ],
            };
          }),
        }));
      },

      requestOrderAction: (orderId, type, reason) => {
        const nowLabel = new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              status: type,
              returnReason: reason,
              timeline: [
                ...order.timeline,
                {
                  status: type,
                  description: `${type} initiated (${reason}). Pickup scheduled within 48 hrs.`,
                  timestamp: nowLabel,
                  completed: true,
                },
              ],
            };
          }),
        }));
      },

      addRecentSearch: (query) => {
        const cleaned = query.trim();
        if (!cleaned) return;
        set((state) => ({
          recentSearches: [
            cleaned,
            ...state.recentSearches.filter(
              (q) => q.toLowerCase() !== cleaned.toLowerCase()
            ),
          ].slice(0, 6),
        }));
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      trackProductView: (productId) => {
        set((state) => ({
          recentlyViewed: [
            productId,
            ...state.recentlyViewed.filter((id) => id !== productId),
          ].slice(0, 10),
        }));
      },

      addProductReview: (productId, review) => {
        const newReview: ProductReview = {
          ...review,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
          helpfulCount: 0,
        };
        set((state) => ({
          productReviews: {
            ...state.productReviews,
            [productId]: [newReview, ...(state.productReviews[productId] || [])],
          },
        }));
      },

      showToast: (message, type = 'success') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts.slice(-2), { id, message, type }],
        }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 3200);
      },

      dismissToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: 'stylo-store-v1',
      partialize: (state) => ({
        bag: state.bag,
        wishlist: state.wishlist,
        appliedCouponCode: state.appliedCouponCode,
        user: state.user,
        addresses: state.addresses,
        orders: state.orders,
        recentSearches: state.recentSearches,
        recentlyViewed: state.recentlyViewed,
        productReviews: state.productReviews,
      }),
    }
  )
);
