'use client';

/**
 * Collaboration Provider
 * React Context provider managing real-time collaboration state
 * Handles document operations, presence, and WebSocket synchronization
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  DocumentOperation,
  UserPresence,
  CollaborationState,
  EditorState,
  Document,
  DocumentWithMetadata,
} from '@/lib/collaboration/types';
import {
  transform,
  transformAgainstMultiple,
  applyOperation,
  validateOperation,
} from '@/lib/collaboration/operational-transform';
import {
  getRealtimeClient,
  disconnectRealtimeClient,
  CollaborationRealtimeClient,
} from '@/lib/collaboration/supabase-realtime';

interface CollaborationContextType {
  state: CollaborationState;
  // Document operations
  submitOperation: (operation: Omit<DocumentOperation, 'id' | 'serverVersion' | 'timestamp'>) => Promise<void>;
  // Editor state
  updateEditorState: (updates: Partial<EditorState>) => void;
  // Presence
  updatePresence: (presence: Partial<UserPresence>) => Promise<void>;
  // Sync
  syncDocument: () => Promise<void>;
  // Connection
  connect: (documentId: string, userId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  // Utilities
  canUserEdit: () => boolean;
}

// Context
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Actions
type CollaborationAction =
  | { type: 'INIT_DOCUMENT'; payload: DocumentWithMetadata }
  | { type: 'UPDATE_CONTENT'; payload: { content: string; version: number } }
  | { type: 'ADD_OPERATION'; payload: DocumentOperation }
  | { type: 'CONFIRM_OPERATION'; payload: { clientVersion: number; serverVersion: number } }
  | { type: 'REMOVE_OPERATION'; payload: string }
  | { type: 'UPDATE_PRESENCE'; payload: Record<string, UserPresence> }
  | { type: 'UPDATE_CURSOR'; payload: UserPresence }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'disconnected' | 'reconnecting' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_COMPLETE'; payload: { operations: DocumentOperation[]; version: number } }
  | { type: 'RESET' };

// Initial state
const initialState: CollaborationState = {
  document: null,
  editorState: null,
  remotePresences: {},
  connectionStatus: 'disconnected',
  lastSyncTime: 0,
  syncInProgress: false,
  error: null,
};

// Reducer
function collaborationReducer(state: CollaborationState, action: CollaborationAction): CollaborationState {
  switch (action.type) {
    case 'INIT_DOCUMENT': {
      return {
        ...state,
        document: action.payload,
        editorState: {
          documentId: action.payload.id,
          content: action.payload.content,
          version: action.payload.version,
          cursorPosition: 0,
          pendingOperations: [],
          confirmedVersion: action.payload.version,
          isDirty: false,
        },
      };
    }

    case 'UPDATE_CONTENT': {
      if (!state.editorState) return state;
      return {
        ...state,
        editorState: {
          ...state.editorState,
          content: action.payload.content,
          version: action.payload.version,
          isDirty: false,
        },
      };
    }

    case 'ADD_OPERATION': {
      if (!state.editorState) return state;
      // Apply operation optimistically
      const newContent = applyOperation(state.editorState.content, action.payload);
      return {
        ...state,
        editorState: {
          ...state.editorState,
          content: newContent,
          pendingOperations: [...state.editorState.pendingOperations, action.payload],
          isDirty: true,
        },
      };
    }

    case 'CONFIRM_OPERATION': {
      if (!state.editorState) return state;
      return {
        ...state,
        editorState: {
          ...state.editorState,
          confirmedVersion: action.payload.serverVersion,
          pendingOperations: state.editorState.pendingOperations.filter(
            (op) => op.clientVersion > action.payload.clientVersion
          ),
        },
      };
    }

    case 'REMOVE_OPERATION': {
      if (!state.editorState) return state;
      return {
        ...state,
        editorState: {
          ...state.editorState,
          pendingOperations: state.editorState.pendingOperations.filter((op) => op.id !== action.payload),
        },
      };
    }

    case 'UPDATE_PRESENCE': {
      return {
        ...state,
        remotePresences: action.payload,
      };
    }

    case 'UPDATE_CURSOR': {
      return {
        ...state,
        remotePresences: {
          ...state.remotePresences,
          [action.payload.userId]: action.payload,
        },
      };
    }

    case 'SET_CONNECTION_STATUS': {
      return {
        ...state,
        connectionStatus: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
      };
    }

    case 'SYNC_COMPLETE': {
      if (!state.editorState) return state;
      // Apply received operations to content
      let newContent = state.editorState.content;
      for (const op of action.payload.operations) {
        newContent = applyOperation(newContent, op);
      }
      return {
        ...state,
        editorState: {
          ...state.editorState,
          content: newContent,
          version: action.payload.version,
          confirmedVersion: action.payload.version,
        },
        lastSyncTime: Date.now(),
        syncInProgress: false,
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const [state, dispatch] = useReducer(collaborationReducer, initialState);
  const realtimeClientRef = React.useRef<CollaborationRealtimeClient | null>(null);

  // Connect to collaboration
  const connect = useCallback(async (documentId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'reconnecting' });

      // Initialize realtime client
      realtimeClientRef.current = getRealtimeClient(documentId, userId);

      // Fetch document
      const doc = await realtimeClientRef.current.fetchDocument();
      if (!doc) {
        throw new Error('Document not found');
      }

      dispatch({ type: 'INIT_DOCUMENT', payload: doc });

      // Subscribe to operations
      realtimeClientRef.current.subscribeToOperations((op) => {
        dispatch({ type: 'ADD_OPERATION', payload: op });
      });

      // Subscribe to presence
      realtimeClientRef.current.subscribeToPresence((presences) => {
        const presenceMap = presences.reduce(
          (acc, p) => {
            acc[p.userId] = p;
            return acc;
          },
          {} as Record<string, UserPresence>
        );
        dispatch({ type: 'UPDATE_PRESENCE', payload: presenceMap });
      });

      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Connection failed',
      });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
    }
  }, []);

  // Disconnect from collaboration
  const disconnect = useCallback(async () => {
    try {
      await disconnectRealtimeClient();
      realtimeClientRef.current = null;
      dispatch({ type: 'RESET' });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  // Submit operation
  const submitOperation = useCallback(
    async (operation: Omit<DocumentOperation, 'id' | 'serverVersion' | 'timestamp'>) => {
      if (!state.editorState || !realtimeClientRef.current) {
        return;
      }

      try {
        // Add serverVersion to operation for validation
        const operationWithVersion = {
          ...operation,
          serverVersion: state.editorState.version,
        };

        // Validate operation
        if (!validateOperation(operationWithVersion as DocumentOperation, state.editorState.content.length)) {
          throw new Error('Invalid operation');
        }

        // Create operation with ID
        const fullOperation: DocumentOperation = {
          ...operationWithVersion,
          id: uuidv4(),
          timestamp: Date.now(),
        };

        // Add to pending operations
        dispatch({ type: 'ADD_OPERATION', payload: fullOperation });

        // Send to server
        const result = await realtimeClientRef.current.insertOperation(operationWithVersion);
        if (result) {
          dispatch({
            type: 'CONFIRM_OPERATION',
            payload: { clientVersion: operation.clientVersion, serverVersion: result.serverVersion },
          });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Operation failed',
        });
      }
    },
    [state.editorState]
  );

  // Update editor state
  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    if (!state.editorState) return;
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: {
        content: updates.content ?? state.editorState.content,
        version: updates.version ?? state.editorState.version,
      },
    });
  }, [state.editorState]);

  // Update presence
  const updatePresence = useCallback(
    async (presence: Partial<UserPresence>) => {
      if (!realtimeClientRef.current) return;
      try {
        await realtimeClientRef.current.updatePresence(presence);
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    },
    []
  );

  // Sync document
  const syncDocument = useCallback(async () => {
    if (!state.editorState || !realtimeClientRef.current) {
      return;
    }

    try {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'reconnecting' });

      const operations = await realtimeClientRef.current.fetchOperationsSince(
        state.editorState.confirmedVersion
      );

      dispatch({
        type: 'SYNC_COMPLETE',
        payload: {
          operations,
          version: state.editorState.version + operations.length,
        },
      });

      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  }, [state.editorState]);

  // Check if user can edit
  const canUserEdit = useCallback(() => {
    if (!state.document) return false;
    // Check permission level - would be enhanced with actual permission check
    return true;
  }, [state.document]);

  const value: CollaborationContextType = {
    state,
    submitOperation,
    updateEditorState,
    updatePresence,
    syncDocument,
    connect,
    disconnect,
    canUserEdit,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

/**
 * Hook to use collaboration context
 */
export function useCollaboration(): CollaborationContextType {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}
