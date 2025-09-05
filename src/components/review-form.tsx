"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, Trash2, XCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const reviewSchema = z.object({
  brand: z.string().min(1, 'Brand is required.'),
  manufacturer: z.string().min(1, 'Manufacturer is required.'),
  plasticType: z.string().optional(),
  beachName: z.string().optional(),
  notes: z.string().optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export default function ReviewForm({ contribution }: { contribution: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      brand: contribution.brand_suggestion || '',
      manufacturer: contribution.manufacturer_suggestion || '',
      plasticType: contribution.plastic_type_suggestion || '',
      beachName: contribution.beach_name || '',
      notes: contribution.notes || '',
    },
  });

  const onSubmit = async (data: ReviewValues, status: 'classified' | 'rejected') => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contributions')
        .update({
          brand: data.brand,
          manufacturer: data.manufacturer,
          plastic_type: data.plasticType,
          beach_name: data.beachName,
          notes: data.notes,
          status: status,
          classified_at: new Date().toISOString(),
          // In a real app, you would get the admin's ID from the session
          // classified_by: 'admin_user_id', 
        })
        .eq('id', contribution.id);

      if (error) throw error;

      toast({
        title: `Contribution ${status}!`,
        description: `The item has been successfully ${status}.`,
      });
      router.push('/admin');
      router.refresh();

    } catch (error: any) {
      console.error('Classification failed:', error.message);
      toast({
        variant: 'destructive',
        title: 'Classification Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const images = [
    { label: 'Product Image', url: contribution.product_image_url },
    { label: 'Recycling Image', url: contribution.recycling_image_url },
    { label: 'Manufacturer Image', url: contribution.manufacturer_image_url },
  ].filter(img => img.url);

  return (
    <FormProvider {...form}>
      <form>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Submitted Images</h3>
            <div className="grid grid-cols-1 gap-4">
              {images.map((image, index) => (
                <div key={index}>
                  <p className="text-sm font-medium mb-2">{image.label}</p>
                  <div className="aspect-video relative w-full rounded-lg overflow-hidden border">
                    <Image src={image.url} alt={image.label} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl><Input placeholder="e.g., Coca-Cola" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <FormControl><Input placeholder="e.g., The Coca-Cola Company" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plasticType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plastic Type</FormLabel>
                  <FormControl><Input placeholder="e.g., PETE 1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
                <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Location Details
                </h4>
                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="beachName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Beach Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Marina Beach" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                                <Input value={contribution.latitude?.toFixed(6) || ''} disabled />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                                <Input value={contribution.longitude?.toFixed(6) || ''} disabled />
                            </FormControl>
                        </FormItem>
                    </div>
                </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl><Textarea placeholder="User notes..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
            <Button 
                type="button" 
                variant="destructive"
                onClick={() => onSubmit(form.getValues(), 'rejected')} 
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2" />}
                Reject
            </Button>
            <Button 
                type="button" 
                onClick={form.handleSubmit((data) => onSubmit(data, 'classified'))} 
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                Approve & Classify
            </Button>
        </CardFooter>
      </form>
    </FormProvider>
  );
}
