import React from 'react';
import { cn } from '@/utils/helpers';

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  completed, 
  total, 
  className 
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
        {completed} of {total} lessons completed
      </div>
    </div>
  );
};