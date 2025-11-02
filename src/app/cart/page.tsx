"use client"

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2, ShoppingCart, ArrowRight, MapPin } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, favorites, removeFromCart } = useCartStore();

  const totalValue = cart.reduce((sum, property) => sum + property.price, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} favoritesCount={favorites.length} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding properties to your cart to schedule viewings or make offers.
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
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((property) => (
              <Card key={property.id} className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${property.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(property.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/property/${property.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Cart Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Properties</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Value</span>
                    <span className="font-bold text-primary">
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Properties in your cart are not reserved. Complete checkout to schedule viewings.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
