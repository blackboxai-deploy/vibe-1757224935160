import { NextResponse } from 'next/server';
import { StatsService } from '@/lib/storage';
import { ApiResponse, DashboardStats } from '@/types';

// GET - Fetch dashboard statistics
export async function GET(): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  try {
    const stats = StatsService.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics'
      },
      { status: 500 }
    );
  }
}