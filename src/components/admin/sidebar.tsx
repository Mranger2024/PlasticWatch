'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'dashboard',
  },
  {
    title: 'Contributions',
    href: '/admin/contributions',
    icon: 'fileText',
  },
  {
    title: 'Blog',
    href: '/admin/blog',
    icon: 'fileText',
  },
  {
    title: 'Analytics',
    href: '/admin/stats',
    icon: 'barChart',
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Icons.logo className="h-6 w-6" />
            <span className="">Plastic Watch</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              const Icon = Icons[item.icon];
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary',
                    item.disabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                  {item.disabled && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              v0.1.0
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
