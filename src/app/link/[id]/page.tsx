'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  description?: string;
  createdAt: string;
  clickCount: number;
  isActive: boolean;
}

interface Click {
  id: string;
  linkId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  referer?: string;
}

interface AnalyticsData {
  link: Link;
  clicks: Click[];
  totalClicks: number;
  uniqueClicks: number;
  topCountries: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
  clicksByDate: { date: string; clicks: number }[];
  topReferers: { name: string; count: number }[];
}

export default function LinkAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setLinkId(resolvedParams.id);
        await fetchAnalytics(resolvedParams.id);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params]);

  const fetchAnalytics = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link not found');
        } else {
          throw new Error('Failed to fetch analytics');
        }
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  if (error) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { link, totalClicks, uniqueClicks, topCountries, topCities, topReferers, clicks } = analytics;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Link Analytics</h1>
            <p className="text-muted-foreground">
              {link.title || 'Untitled Link'}
            </p>
          </div>
          <Badge variant={link.isActive ? 'default' : 'secondary'}>
            {link.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Short Link:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/t/{link.shortCode}
                </code>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Original URL:</span>
                <span className="ml-2 text-sm break-all">{link.originalUrl}</span>
              </div>
              {link.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <span className="ml-2 text-sm">{link.description}</span>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="ml-2 text-sm">{formatDateTime(link.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-3xl">{totalClicks}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Visitors</CardDescription>
            <CardTitle className="text-3xl">{uniqueClicks}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Countries</CardDescription>
            <CardTitle className="text-3xl">{topCountries.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cities</CardDescription>
            <CardTitle className="text-3xl">{topCities.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="referrers">Traffic Sources</TabsTrigger>
          <TabsTrigger value="recent">Recent Clicks</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Countries with the most clicks</CardDescription>
              </CardHeader>
              <CardContent>
                {topCountries.length > 0 ? (
                  <div className="space-y-4">
                    {topCountries.slice(0, 10).map((country, index) => (
                      <div key={country.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{country.name}</span>
                          <span>{country.count} clicks</span>
                        </div>
                        <Progress 
                          value={(country.count / totalClicks) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No location data available</p>
                )}
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
                <CardDescription>Cities with the most clicks</CardDescription>
              </CardHeader>
              <CardContent>
                {topCities.length > 0 ? (
                  <div className="space-y-4">
                    {topCities.slice(0, 10).map((city, index) => (
                      <div key={city.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{city.name}</span>
                          <span>{city.count} clicks</span>
                        </div>
                        <Progress 
                          value={(city.count / totalClicks) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No city data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrers">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors came from</CardDescription>
            </CardHeader>
            <CardContent>
              {topReferers.length > 0 ? (
                <div className="space-y-4">
                  {topReferers.map((referer, index) => (
                    <div key={referer.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{referer.name}</span>
                        <span>{referer.count} clicks</span>
                      </div>
                      <Progress 
                        value={(referer.count / totalClicks) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No referrer data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clicks</CardTitle>
              <CardDescription>Latest visitors to your link</CardDescription>
            </CardHeader>
            <CardContent>
              {clicks.length > 0 ? (
                <div className="space-y-3">
                  {clicks.slice(0, 20).map((click, index) => (
                    <div key={click.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <div className="text-sm font-medium">
                          {click.country && click.city 
                            ? `${click.city}, ${click.country}`
                            : click.country || 'Unknown Location'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {click.referer ? `From: ${click.referer}` : 'Direct visit'}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(click.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No clicks recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Back Button */}
      <div className="mt-8">
        <Button asChild variant="outline">
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}