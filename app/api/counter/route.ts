import { NextRequest, NextResponse } from 'next/server';
import { getCounter } from '@/app/lib/counter';

/**
 * GET /api/counter
 * Returns the current counter value
 */
export async function GET(request: NextRequest) {
  try {
    const value = getCounter();
    return NextResponse.json(
      { value },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve counter value' },
      { status: 500 }
    );
  }
}
