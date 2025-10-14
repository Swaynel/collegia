'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface User {
  fullName: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Mock admin user for demo
    setUser({
      fullName: 'Admin User',
      role: 'admin'
    });
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const navigation: NavItem[] = [
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive ? 'bg-gray-50 dark:bg-gray-800 text-white' : 'hover:bg-gray-50 dark:bg-gray-800 hover:text-white'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-lg font-semibold">Admin Panel</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-8 px-4 space-y-2">
            {navigation.map(renderNavItem)}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 border-r  bg-white dark:bg-gray-900">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navigation.map(renderNavItem)}
          </nav>
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">{user.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3  bg-white dark:bg-gray-900">
          <Button
            variant="ghost"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
