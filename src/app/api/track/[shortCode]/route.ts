import { NextRequest, NextResponse } from 'next/server';
import { LinkStorage, ClickStorage } from '@/lib/storage';
import { getClientIP, getLocationFromIP } from '@/lib/location';
import { sanitizeUserAgent, sanitizeReferer } from '@/lib/validation';
import { Click } from '@/types';

interface RouteContext {
  params: Promise<{ shortCode: string }>;
}

// GET - Handle link tracking and redirection
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { shortCode } = params;
    
    if (!shortCode) {
      return NextResponse.json(
        { success: false, error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    // Find the link
    const link = LinkStorage.getLinkByShortCode(shortCode);
    if (!link) {
      // Return a 404 page or redirect to home
      return NextResponse.redirect(new URL('/?error=link-not-found', request.url));
    }
    
    // Check if link is active
    if (!link.isActive) {
      return NextResponse.redirect(new URL('/?error=link-inactive', request.url));
    }
    
    // Collect tracking data
    const ip = getClientIP(request);
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || undefined);
    const referer = sanitizeReferer(request.headers.get('referer') || undefined);
    
    // Create click record (initially without location data)
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const click: Click = {
      id: clickId,
      linkId: link.id,
      timestamp: new Date(),
      ip,
      userAgent,
      referer
    };
    
    // Try to get location data (async, don't block redirect)
    getLocationFromIP(ip).then((locationResult) => {
      if (locationResult.success && locationResult.location) {
        // Update click with location data
        click.country = locationResult.location.country;
        click.countryCode = locationResult.location.countryCode;
        click.region = locationResult.location.region;
        click.city = locationResult.location.city;
        click.latitude = locationResult.location.lat;
        click.longitude = locationResult.location.lon;
        click.isp = locationResult.location.isp;
        click.org = locationResult.location.org;
      }
    }).catch((error) => {
      console.error('Failed to get location data:', error);
    });
    
    // Store the click (with or without location data)
    ClickStorage.addClick(click);
    
    // Redirect to the original URL
    return NextResponse.redirect(link.originalUrl, { status: 302 });
    
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.redirect(new URL('/?error=tracking-failed', request.url));
  }
}

// POST - Alternative endpoint for tracking (can include additional data)
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { shortCode } = params;
    
    if (!shortCode) {
      return NextResponse.json(
        { success: false, error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    
    // Find the link
    const link = LinkStorage.getLinkByShortCode(shortCode);
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Check if link is active
    if (!link.isActive) {
      return NextResponse.json(
        { success: false, error: 'Link is inactive' },
        { status: 403 }
      );
    }
    
    // Collect tracking data
    const ip = getClientIP(request);
    const userAgent = sanitizeUserAgent(
      body.userAgent || request.headers.get('user-agent') || undefined
    );
    const referer = sanitizeReferer(
      body.referer || request.headers.get('referer') || undefined
    );
    
    // Create click record
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const click: Click = {
      id: clickId,
      linkId: link.id,
      timestamp: new Date(),
      ip,
      userAgent,
      referer
    };
    
    // If client provided location data (from browser geolocation API)
    if (body.location) {
      click.latitude = body.location.latitude;
      click.longitude = body.location.longitude;
    } else {
      // Try to get location data from IP
      try {
        const locationResult = await getLocationFromIP(ip);
        if (locationResult.success && locationResult.location) {
          click.country = locationResult.location.country;
          click.countryCode = locationResult.location.countryCode;
          click.region = locationResult.location.region;
          click.city = locationResult.location.city;
          click.latitude = locationResult.location.lat;
          click.longitude = locationResult.location.lon;
          click.isp = locationResult.location.isp;
          click.org = locationResult.location.org;
        }
      } catch (locationError) {
        console.error('Failed to get location data:', locationError);
      }
    }
    
    // Store the click
    ClickStorage.addClick(click);
    
    return NextResponse.json({
      success: true,
      redirectUrl: link.originalUrl,
      message: 'Click tracked successfully'
    });
    
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}