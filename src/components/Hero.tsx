"use client"

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-20 mb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Your Dream Property
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover amazing properties from luxury villas to cozy apartments. 
            Your perfect home is just a click away.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Browse Properties
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
