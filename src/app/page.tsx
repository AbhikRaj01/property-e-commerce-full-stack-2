"use client"

import { useEffect, useState } from 'react';
import { Property } from '@/types/property';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { cart, favorites, toggleFavorite } = useCartStore();

  const fetchProperties = async (filters?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all' && value !== 'any') {
            params.append(key, value);
          }
        });
      }
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
      setProperties(data.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (filters: any) => {
    fetchProperties(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
      
      <Hero />

      <div className="container mx-auto px-4 pb-12">
        <PropertyFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">Error: {error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No properties found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Available Properties ({properties.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(property.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}