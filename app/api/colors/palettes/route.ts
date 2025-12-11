/**
 * GET /api/colors/palettes
 * Retrieve all color palettes
 *
 * Success Response: 200
 * {
 *   palettes: ColorPalette[],
 *   count: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getColorPalettes } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const palettes = await getColorPalettes();

    return NextResponse.json(
      {
        palettes,
        count: palettes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to retrieve color palettes:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve color palettes' },
      { status: 500 }
    );
  }
}
