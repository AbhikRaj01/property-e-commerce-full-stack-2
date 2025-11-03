"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '@/types/property';

interface CartStore {
  cart: Property[];
  favorites: string[];
  userIdentifier: string;
  addToCart: (property: Property) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  isInCart: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  syncFromDatabase: () => Promise<void>;
}

// Generate or retrieve user identifier
const getUserIdentifier = (): string => {
  if (typeof window === 'undefined') return '';
  
  let userId = localStorage.getItem('user_identifier');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', userId);
  }
  return userId;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      userIdentifier: getUserIdentifier(),

      addToCart: async (property) => {
        const { cart, userIdentifier } = get();
        if (cart.find(p => p.id === property.id)) return;

        try {
          // Add to database - convert string ID to integer
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userIdentifier,
              propertyId: parseInt(property.id)
            })
          });

          if (response.ok) {
            // Update local state
            set({ cart: [...cart, property] });
          } else {
            const error = await response.json();
            console.error('Failed to add to cart:', error);
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      },

      removeFromCart: async (id) => {
        const { userIdentifier } = get();
        
        try {
          // Remove from database - convert string ID to integer
          const response = await fetch(`/api/cart?userIdentifier=${userIdentifier}&propertyId=${parseInt(id)}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Update local state
            set({ cart: get().cart.filter(p => p.id !== id) });
          } else {
            const error = await response.json();
            console.error('Failed to remove from cart:', error);
          }
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      },

      clearCart: async () => {
        const { userIdentifier } = get();
        
        try {
          // Clear from database
          const response = await fetch(`/api/cart/clear?userIdentifier=${userIdentifier}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Update local state
            set({ cart: [] });
          } else {
            const error = await response.json();
            console.error('Failed to clear cart:', error);
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      },

      toggleFavorite: async (id) => {
        const { favorites, userIdentifier } = get();
        const isFavorited = favorites.includes(id);

        try {
          if (isFavorited) {
            // Remove from database - convert string ID to integer
            const response = await fetch(`/api/favorites?userIdentifier=${userIdentifier}&propertyId=${parseInt(id)}`, {
              method: 'DELETE'
            });

            if (response.ok) {
              // Update local state
              set({ favorites: favorites.filter(fav => fav !== id) });
            } else {
              const error = await response.json();
              console.error('Failed to remove favorite:', error);
            }
          } else {
            // Add to database - convert string ID to integer
            const response = await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userIdentifier,
                propertyId: parseInt(id)
              })
            });

            if (response.ok) {
              // Update local state
              set({ favorites: [...favorites, id] });
            } else {
              const error = await response.json();
              console.error('Failed to add favorite:', error);
            }
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      },

      syncFromDatabase: async () => {
        const userIdentifier = getUserIdentifier();
        set({ userIdentifier });

        try {
          // Fetch favorites from database
          const favoritesResponse = await fetch(`/api/favorites?userIdentifier=${userIdentifier}`);
          if (favoritesResponse.ok) {
            const favData = await favoritesResponse.json();
            const favoriteIds = favData.favorites.map((f: any) => f.propertyId.toString());
            
            // Fetch cart items from database
            const cartResponse = await fetch(`/api/cart?userIdentifier=${userIdentifier}`);
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              
              // Fetch full property details for cart items
              if (cartData.cartItems.length > 0) {
                const propertyIds = cartData.cartItems.map((item: any) => item.propertyId);
                const propertiesResponse = await fetch('/api/properties');
                
                if (propertiesResponse.ok) {
                  const propertiesData = await propertiesResponse.json();
                  const cartProperties = propertiesData.properties.filter((p: Property) => 
                    propertyIds.includes(parseInt(p.id))
                  );
                  
                  set({ 
                    favorites: favoriteIds,
                    cart: cartProperties
                  });
                }
              } else {
                set({ favorites: favoriteIds });
              }
            }
          }
        } catch (error) {
          console.error('Error syncing from database:', error);
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