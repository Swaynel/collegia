'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Clock, TrendingUp, LogOut } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  tier: 'basics' | 'intermediate' | 'advanced';
  enrolledCount: number;
  averageRating: number;
  totalLessons: number;
  thumbnail: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscription: {
    tier: string;
    status: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && user) {
      fetchCourses();
    }
  }, [authChecked, user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthChecked(true);
      } else {
        console.log('Not authenticated, redirecting to login...');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const stats = [
    { label: 'Enrolled Courses', value: '5', icon: BookOpen, color: 'blue' },
    { label: 'Hours Learned', value: '24', icon: Clock, color: 'green' },
    { label: 'Current Streak', value: '7 days', icon: TrendingUp, color: 'purple' },
  ];

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Logout */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Collegia
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user?.fullName}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back, {user?.fullName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Continue your learning journey with these recommended courses.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                      <stat.icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscription Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Current Plan
                  </p>
                  <p className="text-xl font-bold mt-1 capitalize text-gray-900 dark:text-white">
                    {user?.subscription.tier}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  user?.subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {user?.subscription.status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recommended Courses
              </h3>
              <Button variant="outline">View All</Button>
            </div>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course) => (
                  <CourseCard
                    key={course._id}
                    title={course.title}
                    description={course.description}
                    tier={course.tier}
                    enrolledCount={course.enrolledCount}
                    averageRating={course.averageRating}
                    totalLessons={course.totalLessons}
                    thumbnail={course.thumbnail}
                    onEnroll={() => console.log('Enroll:', course._id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    No courses available yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Recent Activity */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Completed lesson: Introduction to Web Development
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Enrolled in: Advanced JavaScript Patterns
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}