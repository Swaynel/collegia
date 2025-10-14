import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';
import { BookOpen, Users, Star } from 'lucide-react';

interface CourseCardProps {
  title: string;
  description: string;
  tier: 'basics' | 'intermediate' | 'advanced';
  enrolledCount: number;
  averageRating: number;
  totalLessons: number;
  thumbnail: string;
  onEnroll?: () => void;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  tier,
  enrolledCount,
  averageRating,
  totalLessons,
  thumbnail,
  onEnroll,
  isEnrolled = false,
}) => {
  const tierColors = {
    basics: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden relative">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
              tierColors[tier]
            )}
          >
            {tier}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {description}
        </p>
        
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              <span>{enrolledCount}</span>
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>{totalLessons}</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={onEnroll}
          className="w-full"
          variant={isEnrolled ? 'outline' : 'default'}
        >
          {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
        </Button>
      </CardContent>
    </Card>
  );
};
