import Link from 'next/link';
import { Bot, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const footerLinks = [
  {
    title: 'Navigate',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Beaches', href: '/beaches' },
      { name: 'Companies', href: '/companies' },
      { name: 'Contributors', href: '/contributors' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contribute', href: '/contribute' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand and Description */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center space-x-3 mb-6">
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
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Crowdsourcing data to monitor and combat plastic pollution. Join our global community to make a measurable impact on our planet's health.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Facebook, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

       
         {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for the latest updates and insights on plastic pollution.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-background"
              />
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all">
                Subscribe
              </Button>
            </form>
          </div> 


          {/* Footer Links */}
          {footerLinks.map((section, i) => (
            <div key={i} className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground  text-center md:text-left">
            &copy; {new Date().getFullYear()} Plastic Watch. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
