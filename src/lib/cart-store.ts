"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '@/types/property';

interface CartStore {
  cart: Property[];
  favorites: string[];
  addToCart: (property: Property) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  isInCart: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],

      addToCart: (property) => {
        const { cart } = get();
        if (!cart.find(p => p.id === property.id)) {
          set({ cart: [...cart, property] });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter(p => p.id !== id) });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      toggleFavorite: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter(fav => fav !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },

      isInCart: (id) => {
        return get().cart.some(p => p.id === id);
      },

      isFavorite: (id) => {
        return get().favorites.includes(id);
      },
    }),
    {
      name: 'property-cart-storage',
    }
  )
);
