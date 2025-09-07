'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  topPerformingLink?: any;
}

export default function AnalyticsOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load statistics');
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2">
          High-level statistics for all your tracking links
        </p>
      </div>

      {error && (
        <Alert className="mb-8">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Global Stats */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Links Created</CardDescription>
              <CardTitle className="text-4xl">{stats.totalLinks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Links you've created so far
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Clicks</CardDescription>
              <CardTitle className="text-4xl">{stats.totalClicks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                All-time clicks across all links
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Links</CardDescription>
              <CardTitle className="text-4xl">{stats.activeLinks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Currently active tracking links
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Clicks</CardDescription>
              <CardTitle className="text-4xl">
                {stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Average clicks per link
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performing Link */}
      {stats?.topPerformingLink && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Performing Link</CardTitle>
            <CardDescription>Your most clicked tracking link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {stats.topPerformingLink.title || 'Untitled Link'}
                </h3>
                <span className="text-2xl font-bold">{stats.topPerformingLink.clickCount} clicks</span>
              </div>
              <p className="text-sm text-muted-foreground break-all">
                {stats.topPerformingLink.originalUrl}
              </p>
              <div className="flex gap-2 mt-4">
                <Button asChild size="sm">
                  <a href={`/link/${stats.topPerformingLink.id}`}>View Details</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard">View All Links</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Location Tracking</CardTitle>
            <CardDescription>Track visitor locations automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Automatic IP-based geolocation</p>
              <p>• Country, region, and city detection</p>
              <p>• ISP and organization information</p>
              <p>• Privacy-focused data collection</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Features</CardTitle>
            <CardDescription>Comprehensive click tracking and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Real-time click tracking</p>
              <p>• Unique visitor identification</p>
              <p>• Referrer source tracking</p>
              <p>• Time-based analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Actions */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to Create More Links?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create new tracking links to expand your analytics and get more insights about your audience.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <a href="/">Create New Link</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Manage Links</a>
          </Button>
        </div>
      </div>
    </div>
  );
}