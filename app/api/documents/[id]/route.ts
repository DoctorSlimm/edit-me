/**
 * Document Detail API Route
 * Handles document operations: GET (fetch), PUT (update), DELETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { DocumentPermission } from '@/lib/collaboration/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/documents/[id]
 * Fetch document content and metadata
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

    // Check user has access to document
    const { data: permission, error: permError } = await supabase
      .from('document_permissions')
      .select('permission_level')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (permError || !permission) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch permissions
    const { data: permissions } = await supabase
      .from('document_permissions')
      .select('*')
      .eq('document_id', documentId);

    // Fetch active editors
    const { data: sessions } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('document_id', documentId);

    return NextResponse.json({
      ...document,
      permissions: permissions || [],
      activeEditors: sessions || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/documents/[id]
 * Update document content and version
 * NOTE: Individual operations should use /api/documents/[id]/operations
 */
export async function PUT(
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

    if (!permission || (permission.permission_level !== 'editor' && permission.permission_level !== 'admin' && permission.permission_level !== 'owner')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { content, version, title } = body;

    // Check version to prevent conflicts
    const { data: document } = await supabase
      .from('documents')
      .select('version')
      .eq('id', documentId)
      .single();

    if (!document || document.version !== version) {
      return NextResponse.json(
        { error: 'Document version mismatch', currentVersion: document?.version },
        { status: 409 }
      );
    }

    // Update document
    const { data: updated, error } = await supabase
      .from('documents')
      .update({
        content: content !== undefined ? content : undefined,
        title: title !== undefined ? title : undefined,
        version: version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document (owner only)
 */
export async function DELETE(
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

    // Check user is owner
    const { data: document } = await supabase
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (!document || document.owner_id !== userId) {
      return NextResponse.json({ error: 'Only owner can delete' }, { status: 403 });
    }

    // Soft delete
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
