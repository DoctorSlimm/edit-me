import { NextRequest, NextResponse } from 'next/server';
import { decrement } from '@/app/lib/counter';

/**
 * POST /api/counter/decrement
 * Decrements the counter by 1 and returns the new value
 */
export async function POST(request: NextRequest) {
  try {
    const value = decrement();
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
