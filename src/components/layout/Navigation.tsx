'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Settings,
  ChartLine,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and portfolio'
  },
  {
    title: 'Charts',
    href: '/charts',
    icon: ChartLine,
    description: 'TradingView charts',
    badge: 'NEW'
  },
  {
    title: 'Trading',
    href: '/trading',
    icon: TrendingUp,
    description: 'Active trades'
  },
  {
    title: 'AI Analysis',
    href: '/ai',
    icon: Brain,
    description: 'AI insights'
  },
  {
    title: 'Portfolio',
    href: '/portfolio',
    icon: BarChart3,
    description: 'Performance tracking'
  },
  {
    title: 'Live Feed',
    href: '/live',
    icon: Activity,
    description: 'Real-time data'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Preferences'
  }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default Navigation;