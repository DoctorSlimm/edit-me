/**
 * Real-Time Collaboration Types and Interfaces
 * Defines core types for document collaboration, operations, presence, and WebSocket messaging
 */

/**
 * Document Operation Types
 */
export type OperationType = 'insert' | 'delete' | 'replace';

export interface DocumentOperation {
  id: string;
  documentId: string;
  userId: string;
  type: OperationType;
  position: number;
  content: string;
  clientVersion: number;
  serverVersion: number;
  timestamp: number;
  sequenceNumber?: number;
}

/**
 * Document State and Metadata
 */
export interface Document {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  version: number;
  status: 'active' | 'archived' | 'deleted';
  visibility: 'private' | 'shared' | 'public';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface DocumentWithMetadata extends Document {
  permissions: DocumentPermission[];
  activeEditors: UserPresence[];
  pendingOperations?: DocumentOperation[];
}

/**
 * Permission System
 */
export type PermissionLevel = 'viewer' | 'editor' | 'admin' | 'owner';

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  permissionLevel: PermissionLevel;
  sharedAt: Date;
}

export interface PermissionContext {
  userId: string;
  documentId: string;
  permissionLevel: PermissionLevel;
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
}

/**
 * User Presence and Cursor Tracking
 */
export interface UserPresence {
  id: string;
  documentId: string;
  userId: string;
  username?: string;
  avatar?: string;
  cursorPosition: number;
  selectionStart?: number;
  selectionEnd?: number;
  color: string;
  lastActivity: Date;
  connectionId: string;
  isActive: boolean;
}

export interface CursorUpdate {
  userId: string;
  position: number;
  selectionStart?: number;
  selectionEnd?: number;
  timestamp: number;
}

/**
 * Document History and Snapshots
 */
export interface DocumentSnapshot {
  id: string;
  documentId: string;
  userId: string;
  version: number;
  snapshot: string;
  operationCount: number;
  createdAt: Date;
}

/**
 * WebSocket Message Types and Payloads
 */
export enum MessageType {
  // Client -> Server
  OPERATION = 'operation',
  SYNC_REQUEST = 'sync_request',
  PRESENCE_UPDATE = 'presence_update',
  PING = 'ping',

  // Server -> Client
  OPERATION_ACK = 'operation_ack',
  OPERATION_BROADCAST = 'operation_broadcast',
  SYNC_RESPONSE = 'sync_response',
  PRESENCE_BROADCAST = 'presence_broadcast',
  CONFLICT = 'conflict',
  PONG = 'pong',
  ERROR = 'error',
}

export interface WebSocketMessage {
  type: MessageType;
  documentId: string;
  payload: Record<string, any>;
  timestamp: number;
  messageId?: string;
}

export interface OperationMessage {
  type: MessageType.OPERATION;
  documentId: string;
  payload: {
    operation: DocumentOperation;
    clientVersion: number;
  };
  timestamp: number;
  messageId: string;
}

export interface OperationAckMessage {
  type: MessageType.OPERATION_ACK;
  documentId: string;
  payload: {
    messageId: string;
    serverVersion: number;
    appliedAt: number;
    success: boolean;
  };
  timestamp: number;
}

export interface OperationBroadcastMessage {
  type: MessageType.OPERATION_BROADCAST;
  documentId: string;
  payload: {
    operation: DocumentOperation;
    fromUserId: string;
  };
  timestamp: number;
}

export interface SyncRequestMessage {
  type: MessageType.SYNC_REQUEST;
  documentId: string;
  payload: {
    fromVersion: number;
    toVersion?: number;
  };
  timestamp: number;
  messageId: string;
}

export interface SyncResponseMessage {
  type: MessageType.SYNC_RESPONSE;
  documentId: string;
  payload: {
    currentVersion: number;
    currentContent: string;
    operations: DocumentOperation[];
    fromVersion: number;
    toVersion: number;
  };
  timestamp: number;
}

export interface PresenceUpdateMessage {
  type: MessageType.PRESENCE_UPDATE;
  documentId: string;
  payload: {
    userId: string;
    presence: UserPresence;
  };
  timestamp: number;
}

export interface PresenceBroadcastMessage {
  type: MessageType.PRESENCE_BROADCAST;
  documentId: string;
  payload: {
    presences: UserPresence[];
    joined?: UserPresence[];
    left?: string[]; // user IDs
  };
  timestamp: number;
}

export interface ConflictMessage {
  type: MessageType.CONFLICT;
  documentId: string;
  payload: {
    clientVersion: number;
    serverVersion: number;
    operation: DocumentOperation;
    conflictingOperations: DocumentOperation[];
  };
  timestamp: number;
  messageId?: string;
}

export interface ErrorMessage {
  type: MessageType.ERROR;
  documentId: string;
  payload: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: number;
  messageId?: string;
}

/**
 * Client State Management
 */
export interface EditorState {
  documentId: string;
  content: string;
  version: number;
  cursorPosition: number;
  selectionStart?: number;
  selectionEnd?: number;
  pendingOperations: DocumentOperation[];
  confirmedVersion: number;
  isDirty: boolean;
}

export interface CollaborationState {
  document: DocumentWithMetadata | null;
  editorState: EditorState | null;
  remotePresences: Record<string, UserPresence>;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastSyncTime: number;
  syncInProgress: boolean;
  error: string | null;
}

/**
 * Operational Transform Algorithm Types
 */
export interface TransformResult {
  transformedOperation: DocumentOperation;
  conflict: boolean;
  resolution: 'local_priority' | 'remote_priority' | 'merged';
}

export interface TransformContext {
  localOperation: DocumentOperation;
  remoteOperation: DocumentOperation;
  priority: 'local' | 'remote';
}

/**
 * API Request/Response Types
 */
export interface CreateDocumentRequest {
  title: string;
  initialContent?: string;
  visibility?: 'private' | 'shared' | 'public';
}

export interface UpdateDocumentRequest {
  content: string;
  version: number;
}

export interface ShareDocumentRequest {
  userId: string;
  permissionLevel: PermissionLevel;
}

export interface SubmitOperationRequest {
  operation: Omit<DocumentOperation, 'id' | 'serverVersion' | 'timestamp'>;
  clientVersion: number;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OperationListResponse {
  operations: DocumentOperation[];
  total: number;
  fromVersion: number;
  toVersion: number;
}

/**
 * Event Types for Observer Pattern
 */
export type CollaborationEventType =
  | 'operation_received'
  | 'operation_confirmed'
  | 'operation_rejected'
  | 'sync_started'
  | 'sync_completed'
  | 'presence_updated'
  | 'permission_changed'
  | 'connection_established'
  | 'connection_lost'
  | 'error_occurred';

export interface CollaborationEvent {
  type: CollaborationEventType;
  documentId: string;
  timestamp: number;
  data?: Record<string, any>;
}

/**
 * Configuration and Settings
 */
export interface CollaborationConfig {
  maxConcurrentUsers?: number;
  operationBatchSize?: number;
  operationBatchTimeoutMs?: number;
  syncTimeoutMs?: number;
  presenceUpdateIntervalMs?: number;
  maxPendingOperations?: number;
  enableOfflineSupport?: boolean;
  enableConflictResolution?: boolean;
}

/**
 * Type Guards
 */
export function isOperationMessage(msg: WebSocketMessage): msg is OperationMessage {
  return msg.type === MessageType.OPERATION;
}

export function isOperationAckMessage(msg: WebSocketMessage): msg is OperationAckMessage {
  return msg.type === MessageType.OPERATION_ACK;
}

export function isSyncRequestMessage(msg: WebSocketMessage): msg is SyncRequestMessage {
  return msg.type === MessageType.SYNC_REQUEST;
}

export function isSyncResponseMessage(msg: WebSocketMessage): msg is SyncResponseMessage {
  return msg.type === MessageType.SYNC_RESPONSE;
}

export function isConflictMessage(msg: WebSocketMessage): msg is ConflictMessage {
  return msg.type === MessageType.CONFLICT;
}

export function isPresenceUpdateMessage(msg: WebSocketMessage): msg is PresenceUpdateMessage {
  return msg.type === MessageType.PRESENCE_UPDATE;
}

export function canUserWrite(permission: PermissionLevel): boolean {
  return permission === 'editor' || permission === 'admin' || permission === 'owner';
}

export function canUserManage(permission: PermissionLevel): boolean {
  return permission === 'admin' || permission === 'owner';
}
