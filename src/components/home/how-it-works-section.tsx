import { Camera, MapPin, BarChart, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const steps = [
  {
    icon: <Camera className="h-8 w-8 text-white" />,
    title: 'Snap a Photo',
    description: 'Find a piece of plastic waste and take a clear photo of the brand logo and any recycling information.',
    bgColor: 'from-blue-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    features: [
      'High-quality image capture',
      'Multiple photo uploads',
      'Automatic brand detection'
    ]
  },
  {
    icon: <MapPin className="h-8 w-8 text-white" />,
    title: 'Tag the Location',
    description: 'Our app automatically captures the GPS coordinates, helping us map pollution hotspots accurately.',
    bgColor: 'from-teal-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    features: [
      'Automatic GPS detection',
      'Manual location adjustment',
      'Beach and waterway mapping'
    ]
  },
  {
    icon: <BarChart className="h-8 w-8 text-white" />,
    title: 'See the Impact',
    description: 'Your contribution is added to our global database, helping to identify top polluters and drive change.',
    bgColor: 'from-amber-500 to-amber-600',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    features: [
      'Real-time statistics',
      'Pollution heatmaps',
      'Corporate accountability reports'
    ]
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-blue-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/beach-bones.png')]" />
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Plastic Watch Works
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of eco-warriors in our mission to clean up beaches and hold polluters accountable.
            It only takes a minute to make a difference.
          </p>
        </div>

        <div className="grid gap-12 md:gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}
            >
              {/* Step Image */}
              <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden shadow-xl h-64 md:h-96">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`} />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.bgColor} shadow-lg`}>
                      {step.icon}
                    </div>
                    <h3 className="ml-4 text-2xl font-bold">
                      <span className="text-3xl font-extrabold text-yellow-300">0{index + 1}.</span> {step.title}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Step Content */}
              <div className="w-full md:w-1/2">
                <div className="max-w-md mx-auto md:mx-0">
                  <p className="text-lg text-gray-700 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {index === 0 && (
                    <div className="mt-8">
                      <button className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group">
                        Download the App
                        <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-20 text-center bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to make a difference?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our growing community of ocean protectors and start contributing to cleaner beaches today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              Start Contributing
            </button>
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-full hover:bg-blue-50 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* Wave divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10" />
    </section>
  );
}
