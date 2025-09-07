// In-memory storage for demo purposes - easily replaceable with database
import { Link, Click, DashboardStats } from '@/types';

// In-memory stores
const linksStore: Map<string, Link> = new Map();
const clicksStore: Map<string, Click[]> = new Map();

// Helper function to generate short codes
export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate unique short code that doesn't exist
export function generateUniqueShortCode(): string {
  let code = generateShortCode();
  while (linksStore.has(code)) {
    code = generateShortCode();
  }
  return code;
}

// Link management
export class LinkStorage {
  static createLink(originalUrl: string, title?: string, description?: string, customCode?: string): Link {
    const id = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shortCode = customCode || generateUniqueShortCode();
    
    // Check if custom code already exists
    if (customCode && linksStore.has(customCode)) {
      throw new Error('Custom short code already exists');
    }
    
    const link: Link = {
      id,
      originalUrl,
      shortCode,
      title,
      description,
      createdAt: new Date(),
      clickCount: 0,
      isActive: true
    };
    
    linksStore.set(shortCode, link);
    clicksStore.set(id, []);
    
    return link;
  }
  
  static getLinkByShortCode(shortCode: string): Link | undefined {
    return linksStore.get(shortCode);
  }
  
  static getLinkById(id: string): Link | undefined {
    for (const link of linksStore.values()) {
      if (link.id === id) {
        return link;
      }
    }
    return undefined;
  }
  
  static getAllLinks(): Link[] {
    return Array.from(linksStore.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  static updateLinkClickCount(linkId: string): void {
    for (const [shortCode, link] of linksStore.entries()) {
      if (link.id === linkId) {
        link.clickCount += 1;
        linksStore.set(shortCode, link);
        break;
      }
    }
  }
  
  static deleteLink(id: string): boolean {
    for (const [shortCode, link] of linksStore.entries()) {
      if (link.id === id) {
        linksStore.delete(shortCode);
        clicksStore.delete(id);
        return true;
      }
    }
    return false;
  }
  
  static toggleLinkStatus(id: string): boolean {
    for (const [shortCode, link] of linksStore.entries()) {
      if (link.id === id) {
        link.isActive = !link.isActive;
        linksStore.set(shortCode, link);
        return true;
      }
    }
    return false;
  }
}

// Click tracking
export class ClickStorage {
  static addClick(click: Click): void {
    const linkClicks = clicksStore.get(click.linkId) || [];
    linkClicks.push(click);
    clicksStore.set(click.linkId, linkClicks);
    
    // Update link click count
    LinkStorage.updateLinkClickCount(click.linkId);
  }
  
  static getClicksForLink(linkId: string): Click[] {
    return clicksStore.get(linkId) || [];
  }
  
  static getAllClicks(): Click[] {
    const allClicks: Click[] = [];
    for (const clicks of clicksStore.values()) {
      allClicks.push(...clicks);
    }
    return allClicks.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  static getUniqueClicksForLink(linkId: string): number {
    const clicks = clicksStore.get(linkId) || [];
    const uniqueIps = new Set(clicks.map(click => click.ip));
    return uniqueIps.size;
  }
}

// Dashboard statistics
export class StatsService {
  static getDashboardStats(): DashboardStats {
    const links = LinkStorage.getAllLinks();
    const allClicks = ClickStorage.getAllClicks();
    
    const totalLinks = links.length;
    const totalClicks = allClicks.length;
    const activeLinks = links.filter(link => link.isActive).length;
    
    // Find top performing link
    const topPerformingLink = links.reduce((top, current) => 
      (!top || current.clickCount > top.clickCount) ? current : top,
      undefined as Link | undefined
    );
    
    return {
      totalLinks,
      totalClicks,
      activeLinks,
      topPerformingLink
    };
  }
}

// Initialize with sample data for demo
export function initializeSampleData(): void {
  if (linksStore.size === 0) {
    // Create a sample link
    const sampleLink = LinkStorage.createLink(
      'https://example.com',
      'Sample Link',
      'This is a sample tracking link for demo purposes'
    );
    
    // Add some sample clicks
    const sampleClicks: Click[] = [
      {
        id: 'click_1',
        linkId: sampleLink.id,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        referer: 'https://google.com'
      },
      {
        id: 'click_2',
        linkId: sampleLink.id,
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        ip: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        country: 'Canada',
        countryCode: 'CA',
        region: 'Ontario',
        city: 'Toronto',
        latitude: 43.6532,
        longitude: -79.3832
      }
    ];
    
    sampleClicks.forEach(click => ClickStorage.addClick(click));
  }
}