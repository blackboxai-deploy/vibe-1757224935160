'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatDistance } from 'date-fns';

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

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  topPerformingLink?: Link;
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchLinks(),
      fetchStats()
    ]).finally(() => setIsLoading(false));
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      if (data.success) {
        setLinks(data.data || []);
      } else {
        setError(data.error || 'Failed to load links');
      }
    } catch (err) {
      setError('Failed to load links');
      console.error('Error fetching links:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const copyToClipboard = async (shortCode: string, linkId: string) => {
    try {
      const shortUrl = `${window.location.origin}/t/${shortCode}`;
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLinks(links.filter(link => link.id !== linkId));
        fetchStats(); // Refresh stats
      } else {
        alert('Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
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
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your tracking links and their performance
        </p>
      </div>

      {error && (
        <Alert className="mb-8">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Links</CardDescription>
              <CardTitle className="text-3xl">{stats.totalLinks}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Clicks</CardDescription>
              <CardTitle className="text-3xl">{stats.totalClicks}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Links</CardDescription>
              <CardTitle className="text-3xl">{stats.activeLinks}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Performer</CardDescription>
              <CardTitle className="text-sm">
                {stats.topPerformingLink 
                  ? `${stats.topPerformingLink.clickCount} clicks`
                  : 'No data'
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Links</h2>
          <Button asChild>
            <a href="/">Create New Link</a>
          </Button>
        </div>

        {links.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">No links yet</h3>
                  <p className="text-muted-foreground">
                    Create your first tracking link to get started
                  </p>
                </div>
                <Button asChild>
                  <a href="/">Create Link</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {link.title || 'Untitled Link'}
                        </CardTitle>
                        <Badge variant={link.isActive ? 'default' : 'secondary'}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {link.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{link.clickCount}</div>
                      <div className="text-xs text-muted-foreground">clicks</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Short Link:</div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                        {window.location.origin}/t/{link.shortCode}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(link.shortCode, link.id)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedId === link.id ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Original URL:</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {link.originalUrl}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      Created {formatDistance(new Date(link.createdAt), new Date(), { addSuffix: true })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`/link/${link.id}`}>View Analytics</a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}