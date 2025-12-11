/**
 * POST /api/trees/bulk-import
 * Bulk import trees from CSV or JSON
 *
 * Request Body (JSON):
 * {
 *   trees: Array<{
 *     species: string,
 *     planting_date: string (ISO date),
 *     latitude: number,
 *     longitude: number,
 *     health_status: 'healthy' | 'diseased' | 'dead'
 *   }>
 * }
 *
 * Success Response: 200
 * {
 *   message: string,
 *   summary: {
 *     total: number,
 *     successful: number,
 *     failed: number
 *   },
 *   results: {
 *     successful: Tree[],
 *     failed: Array<{ input: any, error: string }>
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { bulkImportTrees, type TreeCreateInput } from '@/lib/trees';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.trees)) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: ['Request body must contain a "trees" array'],
        },
        { status: 400 }
      );
    }

    if (body.trees.length === 0) {
      return NextResponse.json(
        {
          error: 'No trees to import',
          details: ['The trees array is empty'],
        },
        { status: 400 }
      );
    }

    // Perform bulk import
    const result = await bulkImportTrees(body.trees as TreeCreateInput[]);

    return NextResponse.json(
      {
        message: `Bulk import completed: ${result.successful.length} successful, ${result.failed.length} failed`,
        summary: {
          total: body.trees.length,
          successful: result.successful.length,
          failed: result.failed.length,
        },
        results: {
          successful: result.successful,
          failed: result.failed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to bulk import trees:', error);
    return NextResponse.json({ error: 'Failed to process bulk import' }, { status: 500 });
  }
}
