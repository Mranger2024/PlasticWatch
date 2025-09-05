import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers";
import LayoutWrapper from '@/components/layout-wrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Plastic Watch',
  description: 'Crowdsourcing data to monitor and combat plastic pollution on our beaches.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
        </Providers>
      </body>
    </html>
  );
}
