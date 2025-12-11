/**
 * Document Operations API Route
 * Handles operation submission and conflict resolution
 * Uses Operational Transformation for concurrent edits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  transform,
  applyOperation,
  validateOperation,
} from '@/lib/collaboration/operational-transform';
import type { DocumentOperation } from '@/lib/collaboration/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/documents/[id]/operations
 * Fetch operation history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check access
    const { data: permission } = await supabase
      .from('document_permissions')
      .select('permission_level')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (!permission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const fromVersion = parseInt(searchParams.get('fromVersion') || '0');

    // Fetch operations
    let query = supabase
      .from('document_operations')
      .select('*', { count: 'exact' })
      .eq('document_id', documentId)
      .order('server_version', { ascending: true });

    if (fromVersion > 0) {
      query = query.gt('server_version', fromVersion);
    }

    const { data: operations, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch operations' }, { status: 500 });
    }

    return NextResponse.json({
      operations: operations || [],
      total: count || 0,
      limit,
      offset,
      fromVersion,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/documents/[id]/operations
 * Submit an operation and handle conflict resolution
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check user can edit
    const { data: permission } = await supabase
      .from('document_permissions')
      .select('permission_level')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (!permission || !['editor', 'admin', 'owner'].includes(permission.permission_level)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request
    const body = await request.json();
    const { operation, clientVersion } = body;

    if (!operation) {
      return NextResponse.json({ error: 'Operation required' }, { status: 400 });
    }

    // Fetch current document state
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Validate operation
    if (!validateOperation(operation, document.content.length)) {
      return NextResponse.json(
        { error: 'Invalid operation', details: 'Operation out of bounds' },
        { status: 400 }
      );
    }

    // Check for version mismatch
    const serverVersion = document.version;
    const versionGap = serverVersion - clientVersion;

    let transformedOp = { ...operation };
    let conflicted = false;

    // If there's a version gap, transform against intervening operations
    if (versionGap > 0) {
      const { data: intervening } = await supabase
        .from('document_operations')
        .select('*')
        .eq('document_id', documentId)
        .gt('server_version', clientVersion)
        .lte('server_version', serverVersion)
        .order('server_version', { ascending: true });

      if (intervening && intervening.length > 0) {
        conflicted = true;

        // Transform operation against intervening operations
        for (const intOp of intervening) {
          const intOperation = mapRowToOperation(intOp);
          transformedOp = transform(intOperation, transformedOp, 'remote');
        }
      }
    }

    // Verify transformed operation is still valid
    if (!validateOperation(transformedOp, document.content.length)) {
      return NextResponse.json(
        { error: 'Conflict resolution failed', conflicted: true },
        { status: 409 }
      );
    }

    // Apply operation to document content
    const newContent = applyOperation(document.content, transformedOp);

    // Start transaction: insert operation and update document
    const operationId = uuidv4();
    const timestamp = Date.now();
    const newVersion = serverVersion + 1;

    try {
      // Insert operation
      const { data: insertedOp, error: opError } = await supabase
        .from('document_operations')
        .insert({
          id: operationId,
          document_id: documentId,
          user_id: userId,
          operation_type: transformedOp.type,
          position: transformedOp.position,
          content: transformedOp.content,
          client_version: clientVersion,
          server_version: newVersion,
          timestamp,
        })
        .select()
        .single();

      if (opError) {
        return NextResponse.json({ error: 'Failed to insert operation' }, { status: 500 });
      }

      // Update document
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: newContent,
          version: newVersion,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
      }

      // Return result
      return NextResponse.json({
        success: true,
        operation: mapRowToOperation(insertedOp),
        serverVersion: newVersion,
        appliedAt: timestamp,
        conflicted,
        transformed: conflicted,
      });
    } catch (error) {
      console.error('Transaction error:', error);
      return NextResponse.json(
        { error: 'Failed to process operation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Map database row to DocumentOperation
 */
function mapRowToOperation(row: any): DocumentOperation {
  return {
    id: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    type: row.operation_type,
    position: row.position,
    content: row.content || '',
    clientVersion: row.client_version,
    serverVersion: row.server_version,
    timestamp: row.timestamp,
  };
}

/**
 * Extract user ID from JWT token
 */
function extractUserIdFromToken(authHeader: string): string | null {
  try {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || payload.user_id || null;
  } catch (error) {
    return null;
  }
}
