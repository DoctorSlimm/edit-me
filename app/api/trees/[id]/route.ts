/**
 * GET /api/trees/[id]
 * Retrieve a specific tree by ID
 *
 * Success Response: 200
 * {
 *   tree: Tree
 * }
 *
 * Not Found Response: 404
 * {
 *   error: string
 * }
 *
 * PATCH /api/trees/[id]
 * Update a tree record
 *
 * Request Body:
 * {
 *   species?: string,
 *   health_status?: 'healthy' | 'diseased' | 'dead',
 *   // other updatable fields
 * }
 *
 * Success Response: 200
 * {
 *   tree: Tree,
 *   message: string
 * }
 *
 * DELETE /api/trees/[id]
 * Delete a tree record
 *
 * Success Response: 200
 * {
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTree, updateTree, deleteTree } from '@/lib/trees';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const tree = await getTree(id);

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    return NextResponse.json({ tree }, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve tree:', error);
    return NextResponse.json({ error: 'Failed to retrieve tree' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    // Check if tree exists
    const existing = await getTree(id);
    if (!existing) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    // Update the tree
    const updated = await updateTree(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update tree' }, { status: 500 });
    }

    return NextResponse.json(
      {
        tree: updated,
        message: `Tree record updated successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update tree:', error);
    return NextResponse.json({ error: 'Failed to update tree' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;

    // Check if tree exists
    const existing = await getTree(id);
    if (!existing) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    // Delete the tree
    const success = await deleteTree(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete tree' }, { status: 500 });
    }

    return NextResponse.json({ message: `Tree deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete tree:', error);
    return NextResponse.json({ error: 'Failed to delete tree' }, { status: 500 });
  }
}
