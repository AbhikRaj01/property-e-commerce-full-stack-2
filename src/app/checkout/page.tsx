"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { CheckCircle, CreditCard, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  preferredContactTime: z.string().min(1, 'Please select a preferred time'),
  additionalNotes: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationId, setConfirmationId] = useState('');
  const { cart, favorites, clearCart } = useCartStore();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      inquiryType: '',
      preferredContactTime: '',
      additionalNotes: '',
      agreeToTerms: false,
    },
  });

  const totalValue = cart.reduce((sum, property) => sum + property.price, 0);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create orders for each property in cart
      const orderPromises = cart.map(property =>
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: parseInt(property.id),
            buyerName: data.fullName,
            buyerEmail: data.email,
            buyerPhone: data.phone,
            buyerAddress: data.address,
            buyerCity: data.city,
            buyerState: data.state,
            buyerZipCode: data.zipCode,
            inquiryType: data.inquiryType,
            preferredContactTime: data.preferredContactTime,
            additionalNotes: data.additionalNotes || '',
            totalValue: property.price,
          }),
        })
      );

      const responses = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const allSuccessful = responses.every(res => res.ok);
      
      if (!allSuccessful) {
        throw new Error('Some orders failed to process');
      }

      const confirmId = Date.now().toString().slice(-8);
      setConfirmationId(confirmId);
      setIsSubmitted(true);
      clearCart();
      toast.success('Orders submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit orders. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitted) {
    router.push('/cart');
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={0} favoritesCount={favorites.length} />
        
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Inquiry Submitted Successfully!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your interest. Our team will review your inquiry and contact you within 24-48 hours to schedule property viewings.
            </p>
            <div className="bg-secondary/20 rounded-lg p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Confirmation ID</p>
              <p className="text-2xl font-mono font-bold">#{confirmationId}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/')}>
                Browse More Properties
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/favorites')}>
                View Favorites
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.length} favoritesCount={favorites.length} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pl-10" placeholder="John Doe" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pl-10" placeholder="john@example.com" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" className="pl-10" placeholder="+1 (555) 123-4567" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-10" placeholder="123 Main Street" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="New York" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="NY" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inquiry Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="viewing">Schedule Viewing</SelectItem>
                              <SelectItem value="offer">Make an Offer</SelectItem>
                              <SelectItem value="information">Request Information</SelectItem>
                              <SelectItem value="financing">Financing Options</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredContactTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                              <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                              <SelectItem value="anytime">Anytime</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any specific requirements or questions..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions
                          </FormLabel>
                          <FormDescription>
                            By submitting this inquiry, you agree to be contacted by our team.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((property) => (
                  <div key={property.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.location}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ${property.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Properties</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Value</span>
                  <span className="font-bold text-primary">
                    ${totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  This is an inquiry submission. No payment is required at this time. Our team will contact you to discuss next steps.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}