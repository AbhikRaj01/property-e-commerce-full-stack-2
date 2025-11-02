"use client"

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface FilterState {
  minPrice: string;
  maxPrice: string;
  location: string;
  type: string;
  minBedrooms: string;
  minBathrooms: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    location: '',
    type: 'all',
    minBedrooms: '',
    minBathrooms: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      minPrice: '',
      maxPrice: '',
      location: '',
      type: 'all',
      minBedrooms: '',
      minBathrooms: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Search className="h-5 w-5 mr-2" />
        Search Properties
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="$0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minBedrooms">Min Bedrooms</Label>
          <Select value={filters.minBedrooms} onValueChange={(value) => handleFilterChange('minBedrooms', value)}>
            <SelectTrigger id="minBedrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minBathrooms">Min Bathrooms</Label>
          <Select value={filters.minBathrooms} onValueChange={(value) => handleFilterChange('minBathrooms', value)}>
            <SelectTrigger id="minBathrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button onClick={handleApplyFilters} className="flex-1">
          <Search className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>
    </Card>
  );
}
