"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function PropertyCard({ property, onToggleFavorite, isFavorite = false }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {property.featured && (
          <Badge className="absolute top-2 left-2">Featured</Badge>
        )}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 rounded-full"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(property.id);
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <Link href={`/property/${property.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary">{property.title}</h3>
        </Link>
        
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-2xl font-bold text-primary mb-3">
          ${property.price.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {property.bedrooms} Beds
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms} Baths
          </div>
          <div className="flex items-center">
            <Maximize className="h-4 w-4 mr-1" />
            {property.area.toLocaleString()} sqft
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {property.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/property/${property.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
