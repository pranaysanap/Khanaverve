import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Dish } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface CartState {
  items: CartItem[];
  addToCart: (dish: Dish, vendorId: string) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (dish, vendorId) => {
        const currentItems = get().items;
        // Enforce single-vendor cart: if cart has items from a different vendor, block add
        const currentVendorId = currentItems.length > 0 ? currentItems[0].vendorId : null;
        if (currentVendorId && currentVendorId !== vendorId) {
          toast({
            title: "Cart limited to one hotel",
            description: "Your cart contains items from another hotel. Clear cart to switch.",
            variant: 'destructive'
          });
          return;
        }
        const existingItemIndex = currentItems.findIndex(
          (item) => item.dish.id === dish.id
        );

        if (existingItemIndex !== -1) {
          // If item exists, increase quantity
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += 1;
          set({ items: updatedItems });
        } else {
          // If item doesn't exist, add it to the cart
          set({ items: [...currentItems, { dish, vendorId, quantity: 1 }] });
        }
        toast({
          title: "Added to cart!",
          description: `${dish.name} has been added to your cart.`,
        });
      },
      removeFromCart: (dishId) => {
        set({
          items: get().items.filter((item) => item.dish.id !== dishId),
        });
        toast({
          title: "Item removed",
          description: "The item has been removed from your cart.",
          variant: 'destructive'
        });
      },
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(dishId);
        } else {
          set({
            items: get().items.map((item) =>
              item.dish.id === dishId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.dish.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'khanaveve-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
