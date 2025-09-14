"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useForm, FormProvider } from "react-hook-form";
import { supabase, uploadFile } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, MapPin, Loader2, Check, ArrowLeft, MoveRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from 'next/link';


const LocationMap = dynamic(
  () => import('@/components/map/LocationMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }
);

const contributionSchema = z.object({
  productImage: z.any().refine(file => file, "Product image is required."),
  backsideImage: z.any().optional(),
  recyclingImage: z.any().optional(),
  manufacturerImage: z.any().optional(),
  brand: z.string().min(2, "Brand name is required."),
  plasticType: z.string().min(1, "Plastic type is required."),
  beachName: z.string().optional(),
  notes: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

type FormData = z.infer<typeof contributionSchema>;

interface ImageState {
  productImage?: string;
  backsideImage?: string;
  recyclingImage?: string;
  manufacturerImage?: string;
}

export default function ContributionForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [images, setImages] = useState<ImageState>({});
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputsRef = useRef<{[key: string]: File | null}>({
    productImage: null,
    backsideImage: null,
    recyclingImage: null,
    manufacturerImage: null
  });

  const form = useForm<FormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      brand: "",
      plasticType: "",
      beachName: "",
      notes: "",
      location: { lat: 0, lng: 0 }
    }
  });

  const steps = [
    { id: "location", title: "Location" },
    { id: "photos", title: "Photos" },
    { id: "details", title: "Details" },
    { id: "submit", title: "Submit" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file object for later submission
    fileInputsRef.current[fieldName] = file;

    // Update form data with the file
    form.setValue(fieldName as any, file, { shouldValidate: true });

    // Create preview
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      setImages((prev: ImageState) => ({
        ...prev,
        [fieldName]: event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          form.setValue('location', { lat: latitude, lng: longitude });
          toast({
            title: "Location updated",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: "Could not get your location. Please try again or select from the map.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    form.setValue('location', { lat, lng });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (mapView) {
      setMapView(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const url = await uploadFile(file, 'images');
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Upload images and get their URLs
      console.log('Form data before upload:', {
        hasManufacturerImage: !!formData.manufacturerImage,
        manufacturerImage: formData.manufacturerImage
      });
      
      const uploadedImages = await Promise.all([
        uploadImage(formData.productImage),
        formData.backsideImage ? uploadImage(formData.backsideImage) : Promise.resolve(null),
        formData.recyclingImage ? uploadImage(formData.recyclingImage) : Promise.resolve(null),
        formData.manufacturerImage ? uploadImage(formData.manufacturerImage) : Promise.resolve(null)
      ]);
      
      console.log('Uploaded images:', uploadedImages);

      // Prepare the submission data
      const submissionData = {
        product_image_url: uploadedImages[0],
        backside_image_url: uploadedImages[1],
        recycling_image_url: uploadedImages[2],
        manufacturer_image_url: uploadedImages[3],
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        beach_name: formData.beachName || null,
        brand: formData.brand,
        plastic_type: formData.plasticType,
        notes: formData.notes || null,
        status: 'pending'
      };

      // Log the data being sent to Supabase
      const contributionData = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        product_image_url: submissionData.product_image_url,
        backside_image_url: submissionData.backside_image_url,
        recycling_image_url: submissionData.recycling_image_url,
        manufacturer_image_url: submissionData.manufacturer_image_url,
        latitude: submissionData.latitude,
        longitude: submissionData.longitude,
        beach_name: submissionData.beach_name,
        brand_suggestion: submissionData.brand,
        plastic_type_suggestion: submissionData.plastic_type,
        notes: submissionData.notes,
        status: 'pending' as const
      };
      
      console.log('Submitting to Supabase:', contributionData);
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('contributions')
        .insert([contributionData])
        .select();

      if (error) throw error;
      
      console.log('Contribution submitted successfully:', data);
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your contribution has been submitted.",
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your contribution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (isSubmitted) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your contribution has been submitted successfully.</p>
          <Button onClick={() => {
            setCurrentStep(0);
            setIsSubmitted(false);
            form.reset();
            setImages({});
            setLocation(null);
          }}>
            Submit Another
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Where did you find it?</h2>
              <p className="text-gray-600 mb-6">Help us map plastic pollution by sharing the location</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                type="button" 
                onClick={handleLocation}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-teal-500 bg-white"
              >
                <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                Use My Current Location
              </Button>
              
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <LocationMap 
                  onLocationSelect={handleLocationSelect} 
                  initialPosition={location ? [location.lat, location.lng] : undefined} 
                />
              </div>
              
              {location && (
                <div className="text-sm text-teal-700 bg-teal-50 p-3 rounded-lg flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Location selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Photos</h2>
              <p className="text-gray-600">Take clear photos of the plastic item</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ImageUploadField 
                    name="productImage" 
                    label="Product Front" 
                    description="Show the front of the product"
                    onFileChange={handleFileChange} 
                    imagePreview={images.productImage} 
                  />
                  <ImageUploadField 
                    name="backsideImage" 
                    label="Product Back" 
                    description="Show the back of the product"
                    onFileChange={handleFileChange} 
                    imagePreview={images.backsideImage} 
                    optional
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ImageUploadField 
                    name="recyclingImage" 
                    label="Recycling Info" 
                    description="Show recycling symbols"
                    onFileChange={handleFileChange} 
                    imagePreview={images.recyclingImage} 
                    optional
                  />
                  <ImageUploadField 
                    name="manufacturerImage" 
                    label="Manufacturer" 
                    description="Show manufacturer details"
                    onFileChange={handleFileChange} 
                    imagePreview={images.manufacturerImage} 
                    optional
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Details</h2>
              <p className="text-gray-600">Tell us more about this item</p>
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coca-Cola, Nestlé" {...field} />
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
                      <Input placeholder="e.g., PET, HDPE, PP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="beachName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beach/Location Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bondi Beach" {...field} />
                    </FormControl>
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
                      <Textarea 
                        placeholder="Any additional details about the item or location..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6">
            <div className="flex items-center mb-6">
                 <Button 
                  asChild 
                  className="hover:bg-teal-50 text-teal-700"
                  variant="ghost"
                >
                  <Link href="/" className="flex items-center">
                    <ArrowLeft className="w-7 h-7 border border-teal-700 rounded-full p-1" />
                  </Link>
                </Button>
                   <h1 className="text-2xl md:text-3xl text-center font-bold text-gray-900 ">Report Plastic Pollution</h1>  
            </div>
        {/* Progress Steps */}
        <div className="flex justify-between relative mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div 
              className="h-full bg-teal-600 transition-all duration-300" 
              style={{ 
                width: `${(currentStep / (steps.length - 1)) * 100}%` 
              }} 
            />
          </div>
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center z-10 bg-white">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors",
                  currentStep >= index 
                    ? "bg-teal-600 text-white" 
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {currentStep > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={cn(
                  "text-xs font-medium",
                  currentStep === index ? "text-teal-700" : "text-gray-500"
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {!isSubmitted && (
              <div className="flex justify-between pt-6 mt-8 border-t">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0 && !mapView}
                  variant={currentStep === 0 && !mapView ? "ghost" : "outline"}
                  className={cn(
                    "px-6",
                    currentStep === 0 && !mapView && "opacity-0 pointer-events-none"
                  )}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={currentStep === 0 && !location}
                    className="px-6 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Continue
                    <MoveRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Contribution"
                    )}
                  </Button>
                )}
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

interface ImageUploadFieldProps {
  name: string;
  label: string;
  description: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
  imagePreview?: string;
  optional?: boolean;
}

function ImageUploadField({ 
  name, 
  label, 
  description, 
  onFileChange, 
  imagePreview,
  optional = false
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const event = {
      target: { files: [] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onFileChange(event, name);
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all",
        imagePreview 
          ? "border-gray-200 hover:border-teal-300" 
          : "border-gray-300 hover:border-teal-400 bg-gray-50"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onFileChange(e, name)}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
            <Camera className="h-6 w-6 text-teal-600" />
          </div>
          <h4 className="font-medium text-gray-900 flex items-center">
            {label}
            {!optional && <span className="text-red-500 ml-1">*</span>}
          </h4>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>
          <p className="text-xs text-gray-400 mt-2">Click to upload or drag and drop</p>
        </div>
      )}
    </div>
  );
}