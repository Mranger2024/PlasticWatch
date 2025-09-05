
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { getAISettings } from "@/lib/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, MapPin, Loader2, Wand2, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestDataTags } from "@/ai/flows/suggest-data-tags";
import { supabase } from "@/lib/supabase/client";

const contributionSchema = z.object({
  productImage: z.any().refine(file => file, "Product image is required."),
  recyclingImage: z.any().optional(),
  manufacturerImage: z.any().optional(),
  brand: z.string().min(1, "Brand is required."),
  manufacturer: z.string().min(1, "Manufacturer is required."),
  plasticType: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  beachName: z.string().optional(),
  notes: z.string().optional(),
});

const skippedContributionSchema = contributionSchema.extend({
    brand: z.string().optional(),
    manufacturer: z.string().optional(),
});

type ContributionValues = z.infer<typeof contributionSchema>;

type ImageState = {
  productImage?: string;
  recyclingImage?: string;
  manufacturerImage?: string;
};

const steps = [
  { id: "location", title: "Location", description: "Share where you found it" },
  { id: "photos", title: "Photos", description: "Capture the plastic waste" },
  { id: "details", title: "Details", description: "Review AI suggestions" },
  { id: "submit", title: "Submit", description: "Help us track pollution" },
];

const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export default function ContributionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<ImageState>({});
  const [location, setLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContributionValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      brand: "",
      manufacturer: "",
      plasticType: "",
      beachName: "",
      notes: ""
    },
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleLocation = async () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported by your browser.' });
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        form.setValue("location", { latitude, longitude });
        toast({ title: "Location captured successfully!" });
        setIsLocationLoading(false);
        nextStep();
      },
      () => {
        toast({ variant: 'destructive', title: 'Unable to retrieve your location. Please enable location services.' });
        setIsLocationLoading(false);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ImageState) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setImages(prev => ({ ...prev, [fieldName]: dataUri }));
        form.setValue(fieldName as any, dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const runAiSuggestions = useCallback(async () => {
    if (!images.productImage) {
      toast({ variant: "destructive", title: "Product image is required to get AI suggestions." });
      return;
    }

      // Check if AI is enabled in settings
    try {
      const aiSettings = await getAISettings();
      setIsAiEnabled(aiSettings?.ai_enabled ?? false);
      
      if (!aiSettings?.ai_enabled) {
        toast({
          title: "AI Analysis Disabled",
          description: "AI image analysis is currently disabled in the admin settings.",
          variant: "default",
        });
        return;
      }
    } catch (error) {
      console.error('Error checking AI settings:', error);
      toast({
        title: "Error",
        description: "Unable to check AI settings. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    setIsAiLoading(true);
    try {
        const aiPromise = suggestDataTags({
            productImageUri: images.productImage,
            recyclingImageUri: images.recyclingImage,
            manufacturerDetailsImageUri: images.manufacturerImage,
            location: location ?? undefined,
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI suggestions timed out')), 15000));

        const result = await Promise.race([aiPromise, timeoutPromise]) as any;

        if (result.brand) form.setValue("brand", result.brand);
        if (result.manufacturer) form.setValue("manufacturer", result.manufacturer);
        if (result.plasticType) form.setValue("plasticType", result.plasticType);

        toast({
            title: "AI Suggestions Applied",
            description: "Please review and adjust the details below.",
        });
    } catch (error: any) {
        console.error("AI suggestion failed:", error);
        const description = error.message === 'AI suggestions timed out'
            ? "The AI is taking too long to respond. Please fill in the details manually or try again later."
            : "Could not get AI suggestions. Please fill in the details manually.";
        toast({
            variant: "destructive",
            title: "AI Suggestion Failed",
            description: description,
        });
    } finally {
        setIsAiLoading(false);
    }
  }, [images, location, form, toast]);


  useEffect(() => {
    if (currentStep === 2 && images.productImage && !form.getValues('brand')) {
      runAiSuggestions();
    }
  }, [currentStep, images.productImage, runAiSuggestions, form]);

  const uploadImage = async (dataUri: string): Promise<string | null> => {
    if (!dataUri) return null;
    const blob = dataURItoBlob(dataUri);
    const fileExt = blob.type.split('/')[1];
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage.from('contributions').upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('contributions').getPublicUrl(data.path);
    return publicUrl;
  };
  
  const onSubmit = async (data: ContributionValues, status: 'pending' ) => {
    setIsSubmitting(true);

    try {
      const productImagePromise = uploadImage(images.productImage!);
      const recyclingImagePromise = uploadImage(images.recyclingImage!);
      const manufacturerImagePromise = uploadImage(images.manufacturerImage!);

      const [product_image_url, recycling_image_url, manufacturer_image_url] = await Promise.all([
          productImagePromise,
          recyclingImagePromise,
          manufacturerImagePromise
      ]);

      if (!product_image_url) {
        throw new Error('Product image failed to upload.');
      }

      const { error: dbError } = await supabase.from('contributions').insert({
        product_image_url,
        recycling_image_url,
        manufacturer_image_url,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
        beach_name: data.beachName,
        brand_suggestion: data.brand,
        manufacturer_suggestion: data.manufacturer,
        plastic_type_suggestion: data.plasticType,
        notes: data.notes,
        status: status,
      });

      if (dbError) {
        throw dbError;
      }

      setIsSubmitted(true);
      nextStep();

    } catch (error: any) {
        console.error("Submission failed:", error.message);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    const result = await skippedContributionSchema.safeParseAsync(form.getValues());
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'A product image is still required to skip.',
      });
      console.error(result.error);
      return;
    }
    onSubmit(result.data as ContributionValues, 'pending');
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Share Your Location</h3>
            <p className="text-muted-foreground mb-6">We need your location to map where plastic is found. This helps create accurate pollution hotspots.</p>
            <Button onClick={handleLocation} disabled={isLocationLoading} size="lg">
              {isLocationLoading ? <Loader2 className="animate-spin mr-2" /> : <MapPin className="mr-2" />}
              Get My Location
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <ImageUploadField name="productImage" label="Product & Brand" description="Capture a clear photo of the item, focusing on the brand logo." onFileChange={handleFileChange} imagePreview={images.productImage} />
            <ImageUploadField name="recyclingImage" label="Recycling Info (Optional)" description="Photograph the recycling symbol (usually a triangle with a number)." onFileChange={handleFileChange} imagePreview={images.recyclingImage}/>
            <ImageUploadField name="manufacturerImage" label="Manufacturer Details (Optional)" description="Find and capture the 'Made by' or 'Manufactured by' text." onFileChange={handleFileChange} imagePreview={images.manufacturerImage}/>
          </div>
        );
      case 2:
        return (
            <>
              {isAiLoading && (
                  <div className="flex items-center justify-center p-4 rounded-md bg-secondary/50 mb-4">
                      <Loader2 className="animate-spin mr-3 text-primary" />
                      <p className="text-primary-foreground">Our AI is analyzing your images...</p>
                  </div>
              )}
              <div className="flex items-start p-4 rounded-md bg-accent/10 border border-accent/20 mb-6">
                  <Wand2 className="h-6 w-6 text-accent mr-4 mt-1"/>
                  <div>
                      <h4 className="font-semibold text-accent">AI-Powered Suggestions</h4>
                      <p className="text-sm text-muted-foreground">We've pre-filled the fields below. Please review and correct them if needed. If you're unsure, you can skip this step.</p>
                  </div>
              </div>
              <div className="relative group">
                <Button
                  type="button"
                  variant="outline"
                  onClick={runAiSuggestions}
                  disabled={isAiLoading || !images.productImage || isAiEnabled === false}
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Get AI Suggestions
                </Button>
                {isAiEnabled === false && (
                  <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-gray-600 bg-white border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    AI suggestions are currently disabled in the admin settings.
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coca-Cola" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g., The Coca-Cola Company" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g., PETE 1" {...field} />
                    </FormControl>
                    <FormDescription>Look for a number inside a triangle.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beachName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beach Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marina Beach" {...field} />
                    </FormControl>
                     <FormDescription>If you know the name of the beach, please add it here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other observations? e.g., 'Found near a turtle nest'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
        );
      case 3:
        return (
            <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">Your contribution has been successfully submitted. Together, we are making a difference, one piece of plastic at a time.</p>
                <Button onClick={() => window.location.reload()} variant="outline">Submit Another Item</Button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="mb-6">
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
                {steps.map((step, index) => (
                    <div key={step.id} className={`text-center ${index === currentStep ? 'font-semibold text-primary' : ''}`}>
                        <p>{step.title}</p>
                    </div>
                ))}
            </div>
        </div>
        <CardTitle className="text-3xl font-bold">{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].description}</CardDescription>
      </CardHeader>
      <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit((data) => onSubmit(data, 'pending'))} className="space-y-6">
              <div className="py-8">{renderStepContent()}</div>
              
              {!isSubmitted && (
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                    Back
                  </Button>
                  {currentStep < 2 && (
                    <Button type="button" onClick={nextStep} disabled={(currentStep === 1 && !images.productImage)}>
                        Next
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                          Skip for now
                        </Button>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                          {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </FormProvider>
      </CardContent>
    </Card>
  );
}

interface ImageUploadFieldProps {
    name: keyof ImageState;
    label: string;
    description: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ImageState) => void;
    imagePreview?: string;
}

function ImageUploadField({ name, label, description, onFileChange, imagePreview }: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
  
    const openFilePicker = () => {
      inputRef.current?.click();
    };
  
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <div className="flex items-center gap-4">
          <div className="w-40 h-40 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
            {imagePreview ? (
              <img src={imagePreview} alt={`${label} preview`} className="w-full h-full object-cover rounded-md" />
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <FormDescription className="mb-4">{description}</FormDescription>
            <Input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={inputRef}
              onChange={(e) => onFileChange(e, name)}
            />
            <Button type="button" variant="outline" onClick={openFilePicker}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </div>
        </div>
      </FormItem>
    );
}
