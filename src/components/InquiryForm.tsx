"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Mail, Phone, User, Send, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  propertyTitle: string;
  propertyId: string;
}

export default function InquiryForm({ propertyTitle, propertyId }: InquiryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: `I'm interested in ${propertyTitle}. Please contact me with more information.`,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: parseInt(propertyId),
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setIsSubmitted(true);
      toast.success('Inquiry sent successfully!');
      
      setTimeout(() => {
        setIsSubmitted(false);
        form.reset();
      }, 3000);
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.');
      console.error('Inquiry submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Inquiry Sent!</h3>
        <p className="text-muted-foreground">
          We'll get back to you as soon as possible.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold mb-6">Contact About This Property</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Tell us about your interest in this property..."
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Inquiry
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}