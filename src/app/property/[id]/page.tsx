"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Property } from '@/types/property';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import ImageGallery from '@/components/ImageGallery';
import InquiryForm from '@/components/InquiryForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Home,
  Check,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { cart, favorites, toggleFavorite, addToCart, isInCart, isFavorite } = useCartStore();

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/properties?id=${params.id}`);
        if (!response.ok) throw new Error('Property not found');
        
        const data = await response.json();
        setProperty(data.property);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-destructive text-lg mb-4">Error: {error || 'Property not found'}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const inCart = isInCart(property.id);
  const favorited = isFavorite(property.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.length} favoritesCount={favorites.length} />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={property.images} title={property.title} />

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={favorited ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleFavorite(property.id)}
                  >
                    <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  <Home className="h-3 w-3 mr-1" />
                  {property.type}
                </Badge>
                {property.featured && <Badge>Featured</Badge>}
              </div>

              <div className="text-4xl font-bold text-primary mb-6">
                ${property.price.toLocaleString()}
              </div>

              <Card className="p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
                    <Bed className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
                    <Bath className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
                    <Maximize className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.area.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sqft</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
                    <Calendar className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.yearBuilt}</div>
                    <div className="text-sm text-muted-foreground">Year Built</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => addToCart(property)}
                  disabled={inCart || property.status !== 'available'}
                >
                  {inCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  {property.status === 'available'
                    ? 'Add to cart to schedule a viewing or make an offer'
                    : `This property is currently ${property.status}`}
                </div>
              </div>
            </Card>

            <InquiryForm propertyTitle={property.title} propertyId={property.id} />
          </div>
        </div>
      </div>
    </div>
  );
}