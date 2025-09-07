// Simple redirect handler for short links
// This creates URLs like: https://yourdomain.com/t/abc123
import { NextRequest, NextResponse } from 'next/server';
import { LinkStorage, ClickStorage } from '@/lib/storage';
import { getClientIP, getLocationFromIP } from '@/lib/location';
import { sanitizeUserAgent, sanitizeReferer } from '@/lib/validation';
import { Click } from '@/types';

interface RouteContext {
  params: Promise<{ shortCode: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { shortCode } = params;
    
    if (!shortCode) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Find the link
    const link = LinkStorage.getLinkByShortCode(shortCode);
    if (!link) {
      return NextResponse.redirect(new URL('/?error=not-found', request.url));
    }
    
    // Check if link is active
    if (!link.isActive) {
      return NextResponse.redirect(new URL('/?error=inactive', request.url));
    }
    
    // Collect tracking data asynchronously
    const ip = getClientIP(request);
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || undefined);
    const referer = sanitizeReferer(request.headers.get('referer') || undefined);
    
    // Create basic click record
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const click: Click = {
      id: clickId,
      linkId: link.id,
      timestamp: new Date(),
      ip,
      userAgent,
      referer
    };
    
    // Store click immediately and get location data asynchronously
    ClickStorage.addClick(click);
    
    // Try to enhance with location data (don't wait for it)
    getLocationFromIP(ip).then((locationResult) => {
      if (locationResult.success && locationResult.location) {
        // Find and update the click record
        const linkClicks = ClickStorage.getClicksForLink(link.id);
        const clickToUpdate = linkClicks.find(c => c.id === clickId);
        if (clickToUpdate) {
          clickToUpdate.country = locationResult.location.country;
          clickToUpdate.countryCode = locationResult.location.countryCode;
          clickToUpdate.region = locationResult.location.region;
          clickToUpdate.city = locationResult.location.city;
          clickToUpdate.latitude = locationResult.location.lat;
          clickToUpdate.longitude = locationResult.location.lon;
          clickToUpdate.isp = locationResult.location.isp;
          clickToUpdate.org = locationResult.location.org;
        }
      }
    }).catch(error => {
      console.error('Location detection failed:', error);
    });
    
    // Immediate redirect to original URL
    return NextResponse.redirect(link.originalUrl, { status: 302 });
    
  } catch (error) {
    console.error('Error in redirect handler:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}