'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

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

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const stats = [
    { label: 'Enrolled Courses', value: '5', icon: BookOpen, color: 'blue' },
    { label: 'Hours Learned', value: '24', icon: Clock, color: 'green' },
    { label: 'Current Streak', value: '7 days', icon: TrendingUp, color: 'purple' },
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
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
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommended Courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommended Courses</h2>
          <Button variant="outline">View All</Button>
        </div>
        
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
                  <p className="text-sm font-medium">
                    Completed lesson: Introduction to Web Development
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">
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
  );
}