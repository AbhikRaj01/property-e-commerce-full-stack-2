"use client"

import Link from 'next/link';
import { Home, Heart, ShoppingCart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  cartCount?: number;
  favoritesCount?: number;
}

export default function Navbar({ cartCount = 0, favoritesCount = 0 }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="text-xl font-bold">PropertyHub</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Browse
            </Button>
          </Link>
          
          <Link href="/favorites" className="relative">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {favoritesCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
