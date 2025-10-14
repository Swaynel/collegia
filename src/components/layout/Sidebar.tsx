'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';
import { 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Users,
  BarChart3 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Courses',
    href: '/dashboard',
    icon: BookOpen,
  },
  {
    name: 'Resources',
    href: '/dashboard/resources',
    icon: BookOpen,
  },
  {
    name: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: Settings,
  },
];

const adminNavigation = [
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Courses',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const items = isAdmin ? adminNavigation : navigation;

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {isAdmin ? 'Admin' : 'Learn'}
          </h2>
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:bg-gray-800',
                    pathname === item.href && 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};