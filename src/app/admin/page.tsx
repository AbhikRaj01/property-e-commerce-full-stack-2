"use client"

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Property } from '@/types/property';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Settings, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.string().min(1, 'Price is required'),
  location: z.string().min(3, 'Location is required'),
  type: z.string().min(1, 'Property type is required'),
  bedrooms: z.string().min(1, 'Bedrooms is required'),
  bathrooms: z.string().min(1, 'Bathrooms is required'),
  area: z.string().min(1, 'Area is required'),
  yearBuilt: z.string().min(4, 'Year built is required'),
  status: z.string().min(1, 'Status is required'),
  featured: z.boolean(),
  images: z.string().min(1, 'At least one image URL is required'),
  amenities: z.string().min(1, 'Amenities are required'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { cart, favorites } = useCartStore();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      location: '',
      type: 'house',
      bedrooms: '',
      bathrooms: '',
      area: '',
      yearBuilt: '',
      status: 'available',
      featured: false,
      images: '',
      amenities: '',
    },
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onSubmit = async (data: PropertyFormData) => {
    setSubmitting(true);
    
    try {
      const propertyData = {
        ...data,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        area: Number(data.area),
        yearBuilt: Number(data.yearBuilt),
        images: data.images.split(',').map(url => url.trim()),
        amenities: data.amenities.split(',').map(amenity => amenity.trim()),
      };

      const url = editingProperty 
        ? `/api/properties/${editingProperty.id}`
        : '/api/properties';
      
      const method = editingProperty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) throw new Error('Failed to save property');

      await fetchProperties();
      setIsDialogOpen(false);
      setEditingProperty(null);
      form.reset();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    form.reset({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      type: property.type,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      yearBuilt: property.yearBuilt.toString(),
      status: property.status,
      featured: property.featured,
      images: property.images.join(', '),
      amenities: property.amenities.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      await fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProperty(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cart.length} favoritesCount={favorites.length} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center">
              <Settings className="h-10 w-10 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your property listings
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => setEditingProperty(null)}>
                <Plus className="h-5 w-5 mr-2" />
                Add New Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details below to {editingProperty ? 'update' : 'create'} a property listing.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Modern Luxury Villa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the property in detail..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="1000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Malibu, CA" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="3" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (sqft)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="2000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Built</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="2020" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URLs (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="https://images.unsplash.com/photo-1.jpg, https://images.unsplash.com/photo-2.jpg"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter multiple image URLs separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenities (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Pool, Gym, Parking, Garden"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter amenities separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Featured Property
                          </FormLabel>
                          <FormDescription>
                            Mark this property as featured to highlight it on the homepage
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? 'Saving...' : (editingProperty ? 'Update Property' : 'Create Property')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No properties found. Add your first property to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell className="capitalize">{property.type}</TableCell>
                      <TableCell>${property.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {property.featured ? (
                          <Badge>Featured</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(property)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> All changes are stored in memory and will be reset when the server restarts. 
            For production use, connect this to a proper database.
          </p>
        </div>
      </div>
    </div>
  );
}
