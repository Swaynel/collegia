'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Video, Link, Search } from 'lucide-react';
console.log(CardHeader)
console.log(CardTitle)
interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: 'pdf' | 'video' | 'article' | 'tool' | 'other';
  tier: 'basics' | 'intermediate' | 'advanced';
  clickCount: number;
  courseId: {
    title: string;
  };
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        const data = await response.json();
        if (response.ok) {
          setResources(data.resources);
          setFilteredResources(data.resources);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = resources;
    
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }
    
    setFilteredResources(filtered);
  }, [searchTerm, selectedType, resources]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      default: return <Link className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'video': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'article': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Resources</h1>
        <p className="text-muted-foreground mt-2">
          Access supplementary materials and external resources for your courses.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getIconForType(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                    <p className="text-muted-foreground mb-2">{resource.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="capitalize">{resource.courseId?.title}</span>
                      <span>•</span>
                      <span className="capitalize">{resource.tier}</span>
                      <span>•</span>
                      <span>{resource.clickCount} clicks</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              {resources.length === 0 
                ? 'No resources available yet.' 
                : 'Try adjusting your search filters.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}