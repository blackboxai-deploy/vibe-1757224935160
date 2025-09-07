'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CreateLinkResponse {
  success: boolean;
  link?: any;
  shortUrl?: string;
  error?: string;
}

export default function HomePage() {
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    description: '',
    customCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: CreateLinkResponse = await response.json();
      setResult(data);

      if (data.success) {
        // Reset form on success
        setFormData({
          originalUrl: '',
          title: '',
          description: '',
          customCode: ''
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to create link. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Create Tracking Links
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Generate trackable short links and get detailed analytics about your visitors, 
          including their location and click patterns.
        </p>
        
        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Badge variant="secondary">Location Tracking</Badge>
          <Badge variant="secondary">Real-time Analytics</Badge>
          <Badge variant="secondary">Custom Short Codes</Badge>
          <Badge variant="secondary">Click Statistics</Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Create Link Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Tracking Link</CardTitle>
            <CardDescription>
              Enter your URL below to generate a trackable short link with location analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="originalUrl">Original URL *</Label>
                <Input
                  id="originalUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="My Marketing Campaign"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this link..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customCode">Custom Short Code (Optional)</Label>
                <Input
                  id="customCode"
                  placeholder="my-custom-code"
                  value={formData.customCode}
                  onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to generate automatically. Use letters, numbers, hyphens, and underscores only.
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Link...' : 'Create Tracking Link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results and Features */}
        <div className="space-y-6">
          {/* Result Display */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? 'Link Created Successfully!' : 'Error'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Your Tracking Link:</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={result.shortUrl || ''} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(result.shortUrl || '')}
                          variant="outline"
                          size="sm"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    
                    {result.link?.title && (
                      <div>
                        <Label className="text-sm font-medium">Title:</Label>
                        <p className="text-sm text-muted-foreground">{result.link.title}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Original URL:</Label>
                      <p className="text-sm text-muted-foreground break-all">{result.link?.originalUrl}</p>
                    </div>
                    
                    <Alert>
                      <AlertDescription>
                        Your tracking link is ready! Share it anywhere and monitor clicks in your dashboard.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription className="text-red-600">
                      {result.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>What You Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">📍 Location Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect visitor locations including country, region, and city.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium">📊 Detailed Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Track clicks over time, unique visitors, top countries, and referral sources.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium">🔒 Privacy Focused</h4>
                  <p className="text-sm text-muted-foreground">
                    Only collect essential data needed for analytics. No personal information stored.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium">⚡ Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    See click data and location information update instantly in your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Ready to Track Your Links?</h2>
          <p className="text-muted-foreground mb-6">
            View all your tracking links and their analytics in the dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/dashboard">View Dashboard</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/analytics">Analytics Overview</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}