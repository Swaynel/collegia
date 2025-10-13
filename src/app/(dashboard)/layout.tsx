'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';

// ✅ Define clear, strict types
interface Subscription {
  tier: 'basics' | 'intermediate' | 'advanced';
}

interface User {
  fullName: string;
  subscription: Subscription;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Mock user data for now - in production, fetch from API or server
    const mockUser: User = {
      fullName: 'John Doe',
      subscription: { tier: 'basics' },
    };
    setUser(mockUser);
  }, []);

  const handleLogout = async () => {
    // TODO: Implement real logout logic (clear session, cookies, etc.)
    router.push('/login');
  };

  const navigation = [
    { name: 'Courses', href: '/dashboard', icon: BookOpen },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* -------------------- MOBILE SIDEBAR -------------------- */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-lg font-semibold">Online College</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-8 px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* -------------------- DESKTOP SIDEBAR -------------------- */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 border-r bg-card">
          {/* Header */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <span className="text-lg font-semibold">Online College</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User footer section */}
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.subscription.tier} Plan
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- MAIN CONTENT -------------------- */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-card">
          <Button
            variant="ghost"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
