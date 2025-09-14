import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import LayoutWrapper from '@/components/layout-wrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Plastic Watch',
  description: 'Crowdsourcing data to monitor and combat plastic pollution on our beaches.',
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal?: React.ReactNode; // Make modal optional with ?
}

export default function RootLayout({
  children,
  modal,
}: RootLayoutProps) {
  // Get the current pathname from the URL
  const isContribute = false; // Default to false, will be handled by the contribute layout

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-sans bg-background text-foreground antialiased overflow-x-hidden">
        <Providers>
          <div className="flex min-h-screen flex-col w-full max-w-[100vw] overflow-hidden">
            <LayoutWrapper>
              <div className="w-full">
                {children}
                {modal}
              </div>
            </LayoutWrapper>
          </div>
        </Providers>
      </body>
    </html>
  );
}
