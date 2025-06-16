'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, CalendarDays, Settings, Users, Sparkles } from 'lucide-react'; // Added Sparkles for AI
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/checklist', label: 'Checklist', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/vendor-suggestions', label: 'Vendors', icon: Sparkles }, // Added Vendor Suggestions
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-accent-foreground',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
