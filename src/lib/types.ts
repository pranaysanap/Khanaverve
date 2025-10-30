export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Veg' | 'Non-Veg' | 'Sweets' | 'Breads';
  imageId: string;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  cuisine: string[];
  deliveryOptions: ('Delivery' | 'Pickup')[];
  priceFrom: number;
  prepTime: number; // in minutes
  imageId: string;
  dishes: Dish[];
}

export interface CartItem {
  dish: Dish;
  vendorId: string;
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: string; // ISO string
  deliveryAddress: string;
  vendorName: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  avatar?: string;
  addresses: { id: string; fullAddress: string; isDefault: boolean }[];
}

export interface PrimeMembership {
  isActive: boolean;
  expiryDate: string | null; // ISO string
  autoRenew: boolean;
}

export interface Wallet {
  balance: number;
  transactions: { id: string; amount: number; type: 'credit' | 'debit'; date: string; description: string }[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number; // percentage or fixed amount
  type: 'percent' | 'fixed';
  minOrder: number;
  expiry: string; // ISO string
  isUsed: boolean;
}