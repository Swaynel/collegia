'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/course/CourseCard';
import { Input } from '@/components/ui/Input'; // Remove Button import since it's not used
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, Filter, BookOpen } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  tier: 'basics' | 'intermediate' | 'advanced';
  enrolledCount: number;
  averageRating: number;
  totalLessons: number;
  thumbnail: string;
  instructor: {
    name: string;
    _id: string;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses || []);
          setFilteredCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTier !== 'all') {
      filtered = filtered.filter(course => course.tier === selectedTier);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, selectedTier, courses]);

  const handleEnroll = async (courseId: string) => {
    // Implement enrollment logic
    console.log('Enrolling in course:', courseId);
    // In a real app, you would call an API to enroll the user
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="text-muted-foreground mt-2">
          Browse and enroll in our comprehensive course catalog
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Tiers</option>
                <option value="basics">Basics</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold mt-1">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Tiers</p>
                <p className="text-2xl font-bold mt-1">3</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Enrollments</p>
                <p className="text-2xl font-bold mt-1">
                  {courses.filter(c => c.enrolledCount > 0).length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Available Courses ({filteredCourses.length})
          </h2>
        </div>
        
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                title={course.title}
                description={course.description}
                tier={course.tier}
                enrolledCount={course.enrolledCount}
                averageRating={course.averageRating}
                totalLessons={course.totalLessons}
                thumbnail={course.thumbnail}
                onEnroll={() => handleEnroll(course._id)}
                isEnrolled={course.enrolledCount > 0}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                {courses.length === 0 
                  ? 'No courses available yet.' 
                  : 'Try adjusting your search filters.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Tiers Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Course Tiers Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Basics</h3>
              <p className="text-sm text-muted-foreground">
                Free introductory courses covering fundamental concepts and skills.
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Intermediate</h3>
              <p className="text-sm text-muted-foreground">
                Advanced topics with practical projects and live class access.
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Advanced</h3>
              <p className="text-sm text-muted-foreground">
                Expert-level content with personalized mentorship and certificates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}