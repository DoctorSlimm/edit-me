/**
 * Documents API Route
 * Handles document CRUD operations: GET (list), POST (create)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, key);
}

/**
 * GET /api/documents
 * Fetch user's documents with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get user ID from auth header or session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const offset = (page - 1) * pageSize;

    // Fetch documents owned by user or shared with user
    const { data: documents, error: fetchError, count } = await supabase
      .from('documents')
      .select(
        `
        *,
        document_permissions!inner(permission_level)
      `,
        { count: 'exact' }
      )
      .or(
        `owner_id.eq.${userId},and(document_permissions.user_id.eq.${userId})`
      )
      .range(offset, offset + pageSize - 1)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({
      documents: documents || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Create a new document
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, initialContent = '', visibility = 'private' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const documentId = uuidv4();
    const now = new Date().toISOString();

    // Create document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        owner_id: userId,
        title,
        content: initialContent,
        visibility,
        version: 0,
        status: 'active',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (docError) {
      console.error('Database error:', docError);
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    // Add owner permission
    await supabase.from('document_permissions').insert({
      id: uuidv4(),
      document_id: documentId,
      user_id: userId,
      permission_level: 'owner',
      shared_at: now,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract user ID from JWT token
 */
function extractUserIdFromToken(authHeader: string): string | null {
  try {
    const token = authHeader.replace('Bearer ', '');
    // In production, verify the token signature
    // For now, decode without verification for development
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || payload.user_id || null;
  } catch (error) {
    return null;
  }
}
