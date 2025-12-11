/**
 * Document Sync API Route
 * Handles full state synchronization for reconnecting clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, key);
}

/**
 * GET /api/documents/[id]/sync
 * Fetch full document state and operations for sync
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
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
    const fromVersion = parseInt(searchParams.get('fromVersion') || '0');

    // Fetch document
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // If requesting full sync (fromVersion = 0), return current state
    // Otherwise, fetch operations since fromVersion
    let operations = [];
    if (fromVersion < document.version) {
      const { data: ops } = await supabase
        .from('document_operations')
        .select('*')
        .eq('document_id', documentId)
        .gt('server_version', fromVersion)
        .order('server_version', { ascending: true });

      operations = ops || [];
    }

    return NextResponse.json({
      currentVersion: document.version,
      currentContent: document.content,
      operations: operations.map((op: any) => ({
        id: op.id,
        documentId: op.document_id,
        userId: op.user_id,
        type: op.operation_type,
        position: op.position,
        content: op.content || '',
        clientVersion: op.client_version,
        serverVersion: op.server_version,
        timestamp: op.timestamp,
      })),
      fromVersion,
      toVersion: document.version,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
