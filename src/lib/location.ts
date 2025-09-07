// Location detection utilities for IP-based geolocation
import { LocationData, LocationResult } from '@/types';

// Free IP geolocation service - no API key required
const IP_API_URL = 'http://ip-api.com/json';
const IP_API_FIELDS = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query';

// Fallback service
const IPAPI_CO_URL = 'https://ipapi.co';

// Get client IP from request headers
export function getClientIP(req: Request): string {
  const headers = req.headers;
  
  // Try various headers that might contain the real IP
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip) && !isPrivateIP(ip)) {
        return ip;
      }
    }
  }
  
  // Fallback to a demo IP if we can't detect (for development)
  return '8.8.8.8';
}

// Validate IP address format
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(ip) && ip.split('.').every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// Check if IP is private/local
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  
  // Private IP ranges
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 // Localhost
  );
}

// Get location data from IP using ip-api.com (free service)
export async function getLocationFromIP(ip: string): Promise<LocationResult> {
  try {
    // Don't make API calls for private IPs
    if (isPrivateIP(ip)) {
      return {
        success: false,
        error: 'Private IP address'
      };
    }
    
    const response = await fetch(`${IP_API_URL}/${ip}?fields=${IP_API_FIELDS}`, {
      headers: {
        'User-Agent': 'Link Tracker App'
      },
      // Add timeout
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      return {
        success: false,
        error: data.message || 'Failed to get location data'
      };
    }
    
    const location: LocationData = {
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName || data.region,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
      isp: data.isp,
      org: data.org,
      query: data.query
    };
    
    return {
      success: true,
      location
    };
    
  } catch (error) {
    console.error('Error fetching location data:', error);
    
    // Try fallback service
    try {
      const fallbackResponse = await fetch(`${IPAPI_CO_URL}/${ip}/json/`, {
        headers: {
          'User-Agent': 'Link Tracker App'
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        const location: LocationData = {
          country: fallbackData.country_name,
          countryCode: fallbackData.country_code,
          region: fallbackData.region,
          city: fallbackData.city,
          lat: fallbackData.latitude,
          lon: fallbackData.longitude,
          isp: fallbackData.org,
          query: ip
        };
        
        return {
          success: true,
          location
        };
      }
    } catch (fallbackError) {
      console.error('Fallback location service also failed:', fallbackError);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get basic location info from headers (fallback)
export function getLocationFromHeaders(req: Request): LocationData {
  const headers = req.headers;
  
  return {
    country: headers.get('cf-ipcountry') || headers.get('x-country-code') || undefined,
    query: getClientIP(req)
  };
}

// Format location string for display
export function formatLocation(location: LocationData): string {
  const parts: string[] = [];
  
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ') || 'Unknown Location';
}

// Get coordinates for mapping
export function getCoordinates(location: LocationData): [number, number] | null {
  if (location.lat && location.lon) {
    return [location.lat, location.lon];
  }
  return null;
}

// Calculate distance between two coordinates (in kilometers)
export function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Group clicks by country for analytics
export function groupClicksByCountry(clicks: Array<{country?: string}>): Array<{name: string; count: number}> {
  const countryCount = new Map<string, number>();
  
  clicks.forEach(click => {
    const country = click.country || 'Unknown';
    countryCount.set(country, (countryCount.get(country) || 0) + 1);
  });
  
  return Array.from(countryCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Group clicks by city for analytics
export function groupClicksByCity(clicks: Array<{city?: string; country?: string}>): Array<{name: string; count: number}> {
  const cityCount = new Map<string, number>();
  
  clicks.forEach(click => {
    const city = click.city ? `${click.city}, ${click.country || 'Unknown'}` : 'Unknown';
    cityCount.set(city, (cityCount.get(city) || 0) + 1);
  });
  
  return Array.from(cityCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}