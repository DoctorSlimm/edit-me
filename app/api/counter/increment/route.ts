import { NextRequest, NextResponse } from 'next/server';
import { increment } from '@/app/lib/counter';

/**
 * POST /api/counter/increment
 * Increments the counter by 1 and returns the new value
 */
export async function POST(request: NextRequest) {
  try {
    const value = increment();
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
