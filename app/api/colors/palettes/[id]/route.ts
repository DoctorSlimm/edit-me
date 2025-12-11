/**
 * GET /api/colors/palettes/[id]
 * Retrieve a specific color palette with its variants
 *
 * Success Response: 200
 * ColorPalette
 */

import { NextRequest, NextResponse } from 'next/server';
import { getColorPalette } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paletteId = parseInt(id, 10);

    if (isNaN(paletteId)) {
      return NextResponse.json(
        { error: 'Invalid palette ID' },
        { status: 400 }
      );
    }

    const palette = await getColorPalette(paletteId);

    if (!palette) {
      return NextResponse.json(
        { error: 'Palette not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(palette, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve color palette:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve color palette' },
      { status: 500 }
    );
  }
}
