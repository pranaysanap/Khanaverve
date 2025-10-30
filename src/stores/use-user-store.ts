import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, PrimeMembership, Wallet, Order, Coupon, Dish } from '@/lib/types';
import { add } from 'date-fns';

const thirtyDaysFromNow = () => add(new Date(), { days: 30 }).toISOString();

const initialCoupons: Coupon[] = [
    { id: 'c1', code: '10%OFF', description: '10% off on all orders', discount: 10, type: 'percent', minOrder: 200, expiry: thirtyDaysFromNow(), isUsed: false },
    { id: 'c2', code: 'RS50', description: 'Flat ₹50 off', discount: 50, type: 'fixed', minOrder: 300, expiry: thirtyDaysFromNow(), isUsed: false },
    { id: 'c3', code: 'PRIME15', description: 'Extra 15% off for Prime members', discount: 15, type: 'percent', minOrder: 250, expiry: thirtyDaysFromNow(), isUsed: false },
];

const generateRandomPercentCoupons = (count: number): Coupon[] => {
    const coupons: Coupon[] = [];
    for (let i = 0; i < count; i++) {
        const percent = 5 + Math.floor(Math.random() * 16); // 5-20
        const code = `SAVE${percent}`;
        coupons.push({
            id: `rc_${Date.now()}_${i}`,
            code,
            description: `${percent}% off on subtotal`,
            discount: percent,
            type: 'percent',
            minOrder: 150,
            expiry: thirtyDaysFromNow(),
            isUsed: false,
        });
    }
    return coupons;
}

// Extended Dish interface for favorites with vendor information
interface FavoriteDish extends Dish {
  vendorId: string;
  vendorName: string;
}

interface UserState {
  profile: UserProfile;
  prime: PrimeMembership;
  wallet: Wallet;
  orders: Order[];
  coupons: Coupon[];
  favorites: FavoriteDish[]; // Update favorites array type
  setProfile: (profile: UserProfile) => void;
  addOrder: (order: Order) => void;
  updateWalletBalance: (amount: number, type: 'credit' | 'debit', description: string) => void;
  togglePrime: (isActive: boolean) => void;
  useCoupon: (couponId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  purchasePrime: () => { success: boolean; message: string };
  // Add favorites functions
  addFavorite: (dish: FavoriteDish) => void;
  removeFavorite: (dishId: string) => void;
  isFavorite: (dishId: string) => boolean;
}


export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'Nikhil Rajput',
        email: 'nikhil.rajput@example.com',
        phone: '9876543210',
        addresses: [
            { id: 'addr1', fullAddress: '123 Tech Park, Silicon Valley, Mumbai - 400001', isDefault: true },
            { id: 'addr2', fullAddress: '456 Startup Lane, Innovation Hub, Thane - 400601', isDefault: false },
        ],
      },
      prime: {
        isActive: true,
        expiryDate: thirtyDaysFromNow(),
        autoRenew: true,
      },
      wallet: {
        balance: 350,
        transactions: [],
      },
      orders: [],
      coupons: [...initialCoupons, ...generateRandomPercentCoupons(6)],
      favorites: [], // Initialize favorites array

      setProfile: (profile) => set({ profile }),
      
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      
      updateWalletBalance: (amount, type, description) => set((state) => {
        const newBalance = type === 'credit' ? state.wallet.balance + amount : state.wallet.balance - amount;
        const newTransaction = {
            id: `txn_${Date.now()}`,
            amount,
            type,
            date: new Date().toISOString(),
            description,
        };
        return {
            wallet: {
                balance: newBalance,
                transactions: [newTransaction, ...state.wallet.transactions],
            }
        };
      }),
      
      togglePrime: (isActive) => set((state) => ({
        prime: {
            ...state.prime,
            isActive,
            expiryDate: isActive ? thirtyDaysFromNow() : null,
        }
      })),

      useCoupon: (couponId) => set((state) => {
        const updatedCoupons = state.coupons.map(c => 
          c.id === couponId ? {...c, isUsed: true} : c
        );
        // Remove used coupons from localStorage
        const filteredCoupons = updatedCoupons.filter(c => !c.isUsed);
        return { coupons: filteredCoupons };
      }),

      addCoupon: (coupon) => set((state) => ({ coupons: [...state.coupons, coupon] })),

      purchasePrime: () => {
        const state = get();
        const primeCost = 99; // ₹99 for Prime membership
        
        if (state.wallet.balance < primeCost) {
          return { success: false, message: 'Insufficient wallet balance to purchase Prime membership.' };
        }
        
        // Deduct the amount from wallet
        state.updateWalletBalance(primeCost, 'debit', 'Prime membership purchase');
        
        // Activate Prime membership
        set((state) => ({
          prime: {
            ...state.prime,
            isActive: true,
            expiryDate: thirtyDaysFromNow(),
            autoRenew: true,
          }
        }));
        
        return { success: true, message: 'Prime membership purchased successfully!' };
      },

      // Favorites functions
      addFavorite: (dish) => set((state) => {
        // Check if dish is already in favorites
        const isAlreadyFavorite = state.favorites.some(fav => fav.id === dish.id);
        if (isAlreadyFavorite) {
          return state; // Return unchanged state
        }
        return { favorites: [...state.favorites, dish] };
      }),

      removeFavorite: (dishId) => set((state) => ({
        favorites: state.favorites.filter(dish => dish.id !== dishId)
      })),

      isFavorite: (dishId) => {
        const state = get();
        return state.favorites.some(dish => dish.id === dishId);
      },

    }),
    {
      name: 'khanaveve-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);