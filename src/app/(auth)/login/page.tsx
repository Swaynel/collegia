'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface LoginResponse {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    subscription: string;
  };
  token?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Match the same URL pattern as registration
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://collegia-ebon.vercel.app';
      const loginUrl = `${baseUrl}/api/auth/login`;
      
      console.log('🔍 Login URL:', loginUrl);
      console.log('📧 Email:', email);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📄 Content-Type:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type');
      let data: LoginResponse = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('✅ JSON data:', data);
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 500));
        setError(`Server error (${response.status}). Check if the API route exists.`);
        return;
      }

      if (response.ok && data.success) {
        console.log('✨ Login successful!');
        router.push('/dashboard');
      } else {
        const errorMsg = data?.error || `Login failed with status ${response.status}`;
        console.error('❌ Login error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login request failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Sign in to your account to continue
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{' '}
          </span>
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}