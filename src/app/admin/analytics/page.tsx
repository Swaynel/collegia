'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  // Mock analytics data
  const analyticsData = {
    totalRevenue: 125000,
    activeUsers: 1245,
    totalCourses: 45,
    completionRate: 78,
    monthlyGrowth: 12.5,
  };

  const recentActivities = [
    { action: 'New enrollment', user: 'John Doe', course: 'Web Development', time: '2 hours ago' },
    { action: 'Course completed', user: 'Jane Smith', course: 'JavaScript Basics', time: '5 hours ago' },
    { action: 'Payment received', user: 'Mike Johnson', course: 'Advanced React', time: '1 day ago' },
    { action: 'New course published', user: 'Sarah Wilson', course: 'Node.js Fundamentals', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Overview of platform performance and user engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  KES {analyticsData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.monthlyGrowth}% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.activeUsers}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% this month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.totalCourses}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 new this month
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completion Rate</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.completionRate}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% this month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 dark:text-gray-300">Revenue chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 dark:text-gray-300">User growth chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-gray-900 dark:text-white text-sm font-medium">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      <span className="text-primary">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">in {activity.course}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}