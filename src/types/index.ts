// Core data types for the link tracking system

export interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  description?: string;
  createdAt: Date;
  clickCount: number;
  isActive: boolean;
}

export interface Click {
  id: string;
  linkId: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  referer?: string;
  isp?: string;
  org?: string;
}

export interface LocationData {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  query?: string; // IP address
}

export interface AnalyticsData {
  link: Link;
  clicks: Click[];
  totalClicks: number;
  uniqueClicks: number;
  topCountries: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
  clicksByDate: { date: string; clicks: number }[];
  topReferers: { name: string; count: number }[];
}

export interface CreateLinkRequest {
  originalUrl: string;
  title?: string;
  description?: string;
  customCode?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  link?: Link;
  error?: string;
  shortUrl?: string;
}

export interface TrackingResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Location detection results
export interface LocationResult {
  success: boolean;
  location?: LocationData;
  error?: string;
}

// Stats for dashboard
export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  topPerformingLink?: Link;
}