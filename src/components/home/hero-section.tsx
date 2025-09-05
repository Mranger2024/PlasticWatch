import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Beautiful beach with crystal clear water"
          fill
          className="object-cover"
          priority
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-800/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
          <span className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-white">Join 5,000+ ocean protectors</span>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-headline">
          <span className="block">Protect Our Beaches</span>
          <span className="block bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent mt-3">
            From Plastic Pollution
          </span>
        </h1>
        
        <p className="mt-6 text-lg text-blue-100 sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
          Join a global movement to document, track, and eliminate plastic waste from our beautiful coastlines. 
          Your contributions help create a cleaner future for our oceans.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
            asChild
          >
            <Link href="/contribute" className="flex items-center">
              Start Contributing Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="group border-2 border-white/30 bg-white/30 hover:bg-white/10 text-white px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300"
            asChild
          >
            <Link href="#how-it-works" className="flex items-center">
              <Play className="mr-2 h-5 w-5 text-blue group-hover:text-white" />
              Watch Video
            </Link>
          </Button>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: '10K+', label: 'Beaches Monitored' },
            { value: '1.2M+', label: 'Pieces of Waste Tracked' },
            { value: '50+', label: 'Countries' },
            { value: '24/7', label: 'Global Coverage' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-100 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="animate-bounce w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
