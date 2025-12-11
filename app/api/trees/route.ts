/**
 * GET /api/trees
 * Retrieve all trees in the inventory
 *
 * Success Response: 200
 * {
 *   trees: Tree[],
 *   count: number
 * }
 *
 * POST /api/trees
 * Create a new tree record
 *
 * Request Body:
 * {
 *   species: string,
 *   planting_date: string (ISO date),
 *   latitude: number (-90 to 90),
 *   longitude: number (-180 to 180),
 *   health_status: 'healthy' | 'diseased' | 'dead'
 * }
 *
 * Success Response: 201
 * {
 *   tree: Tree,
 *   message: string
 * }
 *
 * Validation Error Response: 400
 * {
 *   error: string,
 *   details: string[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrees, createTree, validateTreeInput, checkDuplicateTree, type TreeCreateInput } from '@/lib/trees';

export async function GET(request: NextRequest) {
  try {
    const trees = await getTrees();

    return NextResponse.json(
      {
        trees,
        count: trees.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to retrieve trees:', error);
    return NextResponse.json({ error: 'Failed to retrieve trees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateTreeInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid tree data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check for duplicates within 5-meter radius
    const duplicate = await checkDuplicateTree(body.latitude, body.longitude, 5);
    if (duplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate tree detected',
          details: ['A tree already exists within 5 meters of this location'],
          existingTree: duplicate,
        },
        { status: 409 }
      );
    }

    // Create the tree
    const tree = await createTree(body as TreeCreateInput);

    if (!tree) {
      return NextResponse.json({ error: 'Failed to create tree' }, { status: 500 });
    }

    return NextResponse.json(
      {
        tree,
        message: `Tree successfully added to the inventory in ${tree.planting_date}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create tree:', error);
    return NextResponse.json({ error: 'Failed to create tree' }, { status: 500 });
  }
}
