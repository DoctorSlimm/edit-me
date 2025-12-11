import { NextRequest, NextResponse } from 'next/server';
import { reset } from '@/app/lib/counter';

/**
 * POST /api/counter/reset
 * Resets the counter to 0 and returns the reset value
 */
export async function POST(request: NextRequest) {
  try {
    const value = reset();
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
      { status: 500 }
    );
  }
}
