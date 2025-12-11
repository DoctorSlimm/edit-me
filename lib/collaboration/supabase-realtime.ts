/**
 * Supabase Real-Time Client Wrapper
 * Manages WebSocket connections and subscriptions for real-time collaboration
 * Handles document operations, presence updates, and state synchronization
 */

import { createClient } from '@supabase/supabase-js';
import { DocumentOperation, UserPresence, WebSocketMessage, MessageType } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Real-Time Client for Collaboration
 * Manages subscriptions to document operations and presence updates
 */
export class CollaborationRealtimeClient {
  private documentId: string;
  private userId: string;
  private subscriptions: any[] = [];
  private handlers: {
    onOperation?: (op: DocumentOperation) => void;
    onPresence?: (presences: UserPresence[]) => void;
    onError?: (error: Error) => void;
  } = {};

  constructor(documentId: string, userId: string) {
    this.documentId = documentId;
    this.userId = userId;
  }

  /**
   * Subscribe to document operations
   * Listens for real-time changes to document_operations table
   */
  async subscribeToOperations(
    callback: (op: DocumentOperation) => void
  ): Promise<void> {
    try {
      this.handlers.onOperation = callback;

      const operationChannel = supabase
        .channel(`doc-operations:${this.documentId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'document_operations',
            filter: `document_id=eq.${this.documentId}`,
          },
          (payload) => {
            const operation = this.mapRowToOperation(payload.new);
            if (operation && operation.userId !== this.userId) {
              // Only notify about operations from other users
              callback(operation);
            }
          }
        )
        .subscribe();

      this.subscriptions.push(operationChannel);
    } catch (error) {
      this.handlers.onError?.(error as Error);
      console.error('Failed to subscribe to operations:', error);
    }
  }

  /**
   * Subscribe to user presence updates
   * Listens for real-time changes to active_sessions table
   */
  async subscribeToPresence(callback: (presences: UserPresence[]) => void): Promise<void> {
    try {
      this.handlers.onPresence = callback;

      const presenceChannel = supabase
        .channel(`doc-presence:${this.documentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'active_sessions',
            filter: `document_id=eq.${this.documentId}`,
          },
          async (payload) => {
            // Fetch all active sessions for this document
            const presences = await this.fetchActivePresences();
            callback(presences);
          }
        )
        .subscribe();

      this.subscriptions.push(presenceChannel);
    } catch (error) {
      this.handlers.onError?.(error as Error);
      console.error('Failed to subscribe to presence:', error);
    }
  }

  /**
   * Subscribe to document content changes
   * Listens for real-time updates to documents table
   */
  async subscribeToDocumentChanges(
    callback: (content: string, version: number) => void
  ): Promise<void> {
    try {
      const documentChannel = supabase
        .channel(`doc-content:${this.documentId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'documents',
            filter: `id=eq.${this.documentId}`,
          },
          (payload) => {
            const doc = payload.new;
            callback(doc.content, doc.version);
          }
        )
        .subscribe();

      this.subscriptions.push(documentChannel);
    } catch (error) {
      this.handlers.onError?.(error as Error);
      console.error('Failed to subscribe to document changes:', error);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    try {
      for (const subscription of this.subscriptions) {
        await supabase.removeChannel(subscription);
      }
      this.subscriptions = [];
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  /**
   * Fetch active presences for a document
   */
  private async fetchActivePresences(): Promise<UserPresence[]> {
    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('document_id', this.documentId);

      if (error) throw error;

      return (data || []).map((row) => this.mapRowToPresence(row));
    } catch (error) {
      console.error('Failed to fetch presences:', error);
      return [];
    }
  }

  /**
   * Insert or update user presence
   */
  async updatePresence(presence: Partial<UserPresence>): Promise<void> {
    try {
      const { error } = await supabase.from('active_sessions').upsert(
        {
          id: presence.id,
          document_id: this.documentId,
          user_id: this.userId,
          cursor_position: presence.cursorPosition ?? 0,
          selection_start: presence.selectionStart,
          selection_end: presence.selectionEnd,
          color: presence.color ?? '#3B82F6',
          connection_id: presence.connectionId ?? `${this.userId}-${Date.now()}`,
          last_activity: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update presence:', error);
      this.handlers.onError?.(error as Error);
    }
  }

  /**
   * Remove user presence session
   */
  async removePresence(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove presence:', error);
    }
  }

  /**
   * Insert a new operation
   */
  async insertOperation(
    operation: Omit<DocumentOperation, 'id' | 'timestamp'>
  ): Promise<DocumentOperation | null> {
    try {
      const { data, error } = await supabase
        .from('document_operations')
        .insert({
          document_id: this.documentId,
          user_id: this.userId,
          operation_type: operation.type,
          position: operation.position,
          content: operation.content,
          client_version: operation.clientVersion,
          server_version: operation.serverVersion,
          timestamp: Date.now(),
        })
        .select()
        .single();

      if (error) throw error;

      return data ? this.mapRowToOperation(data) : null;
    } catch (error) {
      console.error('Failed to insert operation:', error);
      this.handlers.onError?.(error as Error);
      return null;
    }
  }

  /**
   * Fetch operations since a specific version
   */
  async fetchOperationsSince(fromVersion: number): Promise<DocumentOperation[]> {
    try {
      const { data, error } = await supabase
        .from('document_operations')
        .select('*')
        .eq('document_id', this.documentId)
        .gt('server_version', fromVersion)
        .order('server_version', { ascending: true });

      if (error) throw error;

      return (data || []).map((row) => this.mapRowToOperation(row));
    } catch (error) {
      console.error('Failed to fetch operations:', error);
      return [];
    }
  }

  /**
   * Fetch document
   */
  async fetchDocument(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', this.documentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to fetch document:', error);
      return null;
    }
  }

  /**
   * Update document content and version
   */
  async updateDocumentContent(content: string, version: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          content,
          version,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update document:', error);
      this.handlers.onError?.(error as Error);
    }
  }

  /**
   * Create a document snapshot for history
   */
  async createSnapshot(snapshot: string, version: number, operationCount: number): Promise<void> {
    try {
      const { error } = await supabase.from('document_history').insert({
        document_id: this.documentId,
        user_id: this.userId,
        version,
        snapshot,
        operation_count: operationCount,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  }

  /**
   * Map database row to DocumentOperation
   */
  private mapRowToOperation(row: any): DocumentOperation {
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
   * Map database row to UserPresence
   */
  private mapRowToPresence(row: any): UserPresence {
    return {
      id: row.id,
      documentId: row.document_id,
      userId: row.user_id,
      cursorPosition: row.cursor_position,
      selectionStart: row.selection_start,
      selectionEnd: row.selection_end,
      color: row.color,
      lastActivity: new Date(row.last_activity),
      connectionId: row.connection_id,
      isActive: true,
    };
  }
}

/**
 * Helper function to get or create realtime client
 */
let realtimeClient: CollaborationRealtimeClient | null = null;

export function getRealtimeClient(documentId: string, userId: string): CollaborationRealtimeClient {
  if (!realtimeClient || realtimeClient['documentId'] !== documentId) {
    realtimeClient = new CollaborationRealtimeClient(documentId, userId);
  }
  return realtimeClient;
}

/**
 * Helper function to disconnect realtime client
 */
export async function disconnectRealtimeClient(): Promise<void> {
  if (realtimeClient) {
    await realtimeClient.unsubscribeAll();
    realtimeClient = null;
  }
}
