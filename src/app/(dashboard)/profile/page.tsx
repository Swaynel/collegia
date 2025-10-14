'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Calendar, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscription: {
    tier: string;
    status: string;
    startDate: string;
    endDate?: string;
  };
  onboardingCompleted: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({ fullName: userData.fullName });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    // Implement profile update logic
    setEditing(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basics': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }

  if (!user) {
    return <div>Failed to load profile</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              {editing ? (
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              ) : (
                <p className="text-sm">{user.fullName}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Address
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user.role}</p>
            </div>

            <div className="flex space-x-2">
              {editing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Plan</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getTierColor(user.subscription.tier)}`}>
                {user.subscription.tier}
              </span>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Status
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user.subscription.status}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Member Since</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(user.subscription.startDate).toLocaleDateString()}
              </p>
            </div>

            {user.subscription.endDate && (
              <div>
                <label className="text-sm font-medium mb-2 block">Subscription Ends</label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Courses Enrolled</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Lessons Completed</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Learning Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}