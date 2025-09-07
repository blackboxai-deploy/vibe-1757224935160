import { NextRequest, NextResponse } from 'next/server';
import { LinkStorage, ClickStorage } from '@/lib/storage';
import { ApiResponse, Link, AnalyticsData } from '@/types';
import { groupClicksByCountry, groupClicksByCity } from '@/lib/location';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Fetch specific link with analytics
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<AnalyticsData>>> {
  try {
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Link ID is required'
        },
        { status: 400 }
      );
    }
    
    // Find the link
    const link = LinkStorage.getLinkById(id);
    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: 'Link not found'
        },
        { status: 404 }
      );
    }
    
    // Get clicks for this link
    const clicks = ClickStorage.getClicksForLink(id);
    
    // Calculate analytics data
    const totalClicks = clicks.length;
    const uniqueClicks = ClickStorage.getUniqueClicksForLink(id);
    
    // Top countries
    const topCountries = groupClicksByCountry(clicks).slice(0, 10);
    
    // Top cities
    const topCities = groupClicksByCity(clicks).slice(0, 10);
    
    // Clicks by date (last 30 days)
    const clicksByDate = generateClicksByDate(clicks);
    
    // Top referers
    const topReferers = generateTopReferers(clicks);
    
    const analyticsData: AnalyticsData = {
      link,
      clicks,
      totalClicks,
      uniqueClicks,
      topCountries,
      topCities,
      clicksByDate,
      topReferers
    };
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch link data'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a link
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<boolean>>> {
  try {
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Link ID is required'
        },
        { status: 400 }
      );
    }
    
    const deleted = LinkStorage.deleteLink(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Link not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: true,
      message: 'Link deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete link'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate clicks by date
function generateClicksByDate(clicks: any[]): { date: string; clicks: number }[] {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), i));
    return {
      date: format(date, 'yyyy-MM-dd'),
      clicks: 0
    };
  }).reverse();
  
  // Count clicks for each day
  clicks.forEach(click => {
    const clickDate = format(startOfDay(new Date(click.timestamp)), 'yyyy-MM-dd');
    const dayData = last30Days.find(day => day.date === clickDate);
    if (dayData) {
      dayData.clicks++;
    }
  });
  
  return last30Days;
}

// Helper function to generate top referers
function generateTopReferers(clicks: any[]): { name: string; count: number }[] {
  const refererCount = new Map<string, number>();
  
  clicks.forEach(click => {
    const referer = click.referer || 'Direct';
    const domain = referer === 'Direct' ? 'Direct' : extractDomain(referer);
    refererCount.set(domain, (refererCount.get(domain) || 0) + 1);
  });
  
  return Array.from(refererCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}