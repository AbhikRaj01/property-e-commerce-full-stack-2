"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { cart, favorites, toggleFavorite, syncFromDatabase } = useCartStore();

  // Sync data from database on mount
  useEffect(() => {
    syncFromDatabase();
  }, [syncFromDatabase]);

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      setLoading(true);
      
      try {
        // Fetch all properties and filter by favorites
        const response = await fetch('/api/properties');
        const data = await response.json();
        
        const filtered = data.properties.filter((p: Property) => 
          favorites.includes(p.id)
        );
        
        setFavoriteProperties(filtered);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProperties();
  }, [favorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favoriteProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-3xl font-bold mb-4">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding properties to your favorites to easily find them later.
            </p>
            <Button size="lg" onClick={() => router.push('/')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.length} favoritesCount={favorites.length} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold flex items-center">
            <Heart className="h-10 w-10 mr-3 fill-red-500 text-red-500" />
            Your Favorites ({favoriteProperties.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onToggleFavorite={toggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}