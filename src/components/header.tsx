'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Shield, Waves, MapPin, Users, Home, ChevronDown, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

import { ComponentType } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const navigation = {
  main: [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Beaches', href: '/beaches', icon: MapPin },
    { name: 'Companies', href: '/companies', icon: Users },
    { name: 'Contributors', href: '/contributors', icon: Users },
  ] as NavItem[],
  user: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Admin', href: '/admin', icon: Shield },
  ] as NavItem[],
};

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-12 w-12">
                      <Image
                        src="/logos/plastic-watch-logo2.png"
                        alt="Plastic Watch Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
              <span className="text-3xl font-extrabold font-sheriff bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Plastic Watch
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.main.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1.5 group"
                >
                  <Icon className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              asChild 
              variant="ghost" 
              className="hidden md:flex items-center space-x-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <Link href="/dashboard">
                <span>Dashboard</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/contribute" className="flex items-center space-x-1.5">
                <span>Contribute</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-gray-200">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-8">
                      <Waves className="h-8 w-8 text-blue-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">Plastic Watch</span>
                    </div>
                    
                    <nav className="flex-1 space-y-2">
                      {[...navigation.main, ...navigation.user].map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {Icon && <Icon className="mr-3 h-5 w-5 text-blue-600" />}
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                    
                    <div className="pt-4 border-t border-gray-200 mt-auto">
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href="/contribute">Contribute Now</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
