export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'house' | 'apartment' | 'condo' | 'land' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number; // in square feet
  images: string[];
  featured: boolean;
  status: 'available' | 'sold' | 'pending';
  amenities: string[];
  yearBuilt: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  type?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  status?: string;
}
