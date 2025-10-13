import React from 'react';
import { CourseCard } from './CourseCard';

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

interface CourseListProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onEnroll }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course._id}
          title={course.title}
          description={course.description}
          tier={course.tier}
          enrolledCount={course.enrolledCount}
          averageRating={course.averageRating}
          totalLessons={course.totalLessons}
          thumbnail={course.thumbnail}
          onEnroll={() => onEnroll(course._id)}
          isEnrolled={course.enrolledCount > 0}
        />
      ))}
    </div>
  );
};