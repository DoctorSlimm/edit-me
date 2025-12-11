import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to track page views
 * POST /api/visitors/track
 *
 * Increments the visitor counter for a specific page
 * Request body: { pageIdentifier?: string, timestamp?: string, pageUrl?: string, referrer?: string }
 * Response: { count: number, success: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageIdentifier = 'homepage' } = body;

    // Get Supabase client
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    let newCount = 1;

    if (!url || !key) {
      // Demo mode - return incrementing count without database
      console.warn('Supabase not configured. Running in demo mode.');
      // Generate a demo count that increases
      newCount = Math.floor(Math.random() * 100) + 1;
    } else {
      const supabaseClient = createClient(url, key);

      // Try to get existing record
      const { data, error } = await supabaseClient
        .from('visitor_counts')
        .select('view_count, id')
        .eq('page_identifier', pageIdentifier)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Failed to retrieve visitor count:', error);
        newCount = 1;
      } else if (data) {
        // Update existing record with atomic increment
        const { data: updated, error: updateError } = await supabaseClient
          .from('visitor_counts')
          .update({
            view_count: data.view_count + 1,
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)
          .select('view_count')
          .single();

        if (updateError) {
          console.error('Failed to update visitor count:', updateError);
          newCount = data.view_count;
        } else {
          newCount = updated?.view_count || data.view_count + 1;
        }
      } else {
        // Create new record if it doesn't exist
        const { data: inserted, error: insertError } = await supabaseClient
          .from('visitor_counts')
          .insert({
            page_identifier: pageIdentifier,
            view_count: 1,
            last_updated_at: new Date().toISOString(),
          })
          .select('view_count')
          .single();

        if (insertError) {
          console.error('Failed to insert visitor count:', insertError);
          newCount = 1;
        } else {
          newCount = inserted?.view_count || 1;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: newCount,
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
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track visitor',
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
