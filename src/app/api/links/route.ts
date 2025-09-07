import { NextRequest, NextResponse } from 'next/server';
import { LinkStorage, initializeSampleData } from '@/lib/storage';
import { createLinkSchema } from '@/lib/validation';
import { CreateLinkResponse, ApiResponse, Link } from '@/types';

// Initialize sample data on first request
let isInitialized = false;

function ensureInitialized() {
  if (!isInitialized) {
    initializeSampleData();
    isInitialized = true;
  }
}

// GET - Fetch all links
export async function GET(): Promise<NextResponse<ApiResponse<Link[]>>> {
  try {
    ensureInitialized();
    
    const links = LinkStorage.getAllLinks();
    
    return NextResponse.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch links'
      },
      { status: 500 }
    );
  }
}

// POST - Create new tracking link
export async function POST(request: NextRequest): Promise<NextResponse<CreateLinkResponse>> {
  try {
    ensureInitialized();
    
    const body = await request.json();
    
    // Validate input
    const validationResult = createLinkSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.errors[0].message
        },
        { status: 400 }
      );
    }
    
    const { originalUrl, title, description, customCode } = validationResult.data;
    
    try {
      // Create the link
      const link = LinkStorage.createLink(originalUrl, title, description, customCode);
      
      // Generate the short URL
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const shortUrl = `${protocol}://${host}/t/${link.shortCode}`;
      
      return NextResponse.json({
        success: true,
        link,
        shortUrl
      });
      
    } catch (storageError) {
      if (storageError instanceof Error && storageError.message === 'Custom short code already exists') {
        return NextResponse.json(
          {
            success: false,
            error: 'Custom short code is already taken. Please choose a different one.'
          },
          { status: 409 }
        );
      }
      throw storageError;
    }
    
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create link'
      },
      { status: 500 }
    );
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}