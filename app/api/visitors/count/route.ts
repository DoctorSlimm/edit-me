import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to get visitor count
 * GET /api/visitors/count?pageIdentifier=homepage
 *
 * Returns the current visitor count for a specific page
 * Response: { count: number, pageIdentifier: string, success: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageIdentifier = searchParams.get('pageIdentifier') || 'homepage';

    // Get Supabase client
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    let count = 0;

    if (!url || !key) {
      // Demo mode - return a demo count
      console.warn('Supabase not configured. Running in demo mode.');
      count = 42; // Demo value
    } else {
      const supabaseClient = createClient(url, key);

      // Get visitor count from database
      const { data, error } = await supabaseClient
        .from('visitor_counts')
        .select('view_count')
        .eq('page_identifier', pageIdentifier)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Failed to retrieve visitor count:', error);
        count = 0;
      } else if (data) {
        count = data.view_count;
      } else {
        count = 0;
      }
    }

    return NextResponse.json(
      {
        success: true,
        count,
        pageIdentifier,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving visitor count:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve visitor count',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
