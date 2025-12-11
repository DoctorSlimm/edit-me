/**
 * Operational Transformation (OT) Algorithm
 * Implements Client-Server OT for conflict resolution in real-time collaborative editing
 * Handles transformation of concurrent operations to maintain consistency
 */

import { DocumentOperation, TransformResult, TransformContext, OperationType } from './types';

/**
 * Transform Function - Handles concurrent edits
 * Given two operations at the same version, transforms op2 against op1
 * ensuring both operations can be applied in any order with the same result
 *
 * @param op1 - First operation (already applied to server state)
 * @param op2 - Second operation (needs transformation)
 * @param priority - Which operation takes priority on conflict (local vs remote)
 * @returns Transformed operation that can be applied after op1
 */
export function transform(
  op1: DocumentOperation,
  op2: DocumentOperation,
  priority: 'local' | 'remote' = 'remote'
): DocumentOperation {
  const transformed = transformPosition(op1, op2, priority);
  return {
    ...op2,
    position: transformed.position,
    content: transformed.content,
  };
}

/**
 * Transform the position of op2 based on op1's position and operation type
 */
function transformPosition(
  op1: DocumentOperation,
  op2: DocumentOperation,
  priority: 'local' | 'remote'
): { position: number; content: string } {
  // Both are inserts
  if (op1.type === 'insert' && op2.type === 'insert') {
    return transformInsertInsert(op1, op2, priority);
  }

  // Insert vs Delete
  if (op1.type === 'insert' && op2.type === 'delete') {
    return transformInsertDelete(op1, op2);
  }

  // Delete vs Insert
  if (op1.type === 'delete' && op2.type === 'insert') {
    return transformDeleteInsert(op1, op2);
  }

  // Both are deletes
  if (op1.type === 'delete' && op2.type === 'delete') {
    return transformDeleteDelete(op1, op2);
  }

  // Insert vs Replace
  if (op1.type === 'insert' && op2.type === 'replace') {
    return transformInsertReplace(op1, op2);
  }

  // Replace vs Insert
  if (op1.type === 'replace' && op2.type === 'insert') {
    return transformReplaceInsert(op1, op2);
  }

  // Both are replaces
  if (op1.type === 'replace' && op2.type === 'replace') {
    return transformReplaceReplace(op1, op2, priority);
  }

  // Delete vs Replace or Replace vs Delete
  if (op1.type === 'delete' && op2.type === 'replace') {
    return transformDeleteReplace(op1, op2);
  }

  if (op1.type === 'replace' && op2.type === 'delete') {
    return transformReplaceDelete(op1, op2);
  }

  // Default: no transformation needed
  return { position: op2.position, content: op2.content };
}

/**
 * Transform: Insert vs Insert
 * When both operations insert at the same position, use tiebreaker (userId)
 */
function transformInsertInsert(
  op1: DocumentOperation,
  op2: DocumentOperation,
  priority: 'local' | 'remote'
): { position: number; content: string } {
  if (op1.position < op2.position) {
    // op1 is before op2, shift op2 position
    return {
      position: op2.position + op1.content.length,
      content: op2.content,
    };
  } else if (op1.position > op2.position) {
    // op1 is after op2, no change needed
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    // Same position - use priority as tiebreaker
    if (priority === 'local') {
      // op1 (remote) comes first
      return {
        position: op2.position + op1.content.length,
        content: op2.content,
      };
    } else {
      // op2 (local) comes first - no shift
      return {
        position: op2.position,
        content: op2.content,
      };
    }
  }
}

/**
 * Transform: Insert vs Delete
 * If op1 inserts before op2's deletion range, shift the delete position
 */
function transformInsertDelete(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  if (op1.position <= op2.position) {
    // op1 inserts at or before the delete position
    return {
      position: op2.position + op1.content.length,
      content: op2.content,
    };
  } else if (op1.position > op2.position + (op2.content?.length || 0)) {
    // op1 inserts after the delete range, no change
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    // op1 inserts within the delete range, shift position but reduce by insert size
    return {
      position: op2.position,
      content: op2.content,
    };
  }
}

/**
 * Transform: Delete vs Insert
 * If op1 deletes before op2's insertion point, shift the insert position
 */
function transformDeleteInsert(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  const deleteLength = op1.content?.length || 1;

  if (op1.position + deleteLength <= op2.position) {
    // op1 deletes before op2's insertion point
    return {
      position: op2.position - deleteLength,
      content: op2.content,
    };
  } else if (op1.position >= op2.position) {
    // op1 deletes at or after op2's insertion point
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    // op1 deletes overlaps with op2's insertion point
    return {
      position: op1.position,
      content: op2.content,
    };
  }
}

/**
 * Transform: Delete vs Delete
 * Shift second delete if first delete is before it
 */
function transformDeleteDelete(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  const deleteLength = op1.content?.length || 1;

  if (op1.position + deleteLength <= op2.position) {
    // op1 deletes before op2
    return {
      position: op2.position - deleteLength,
      content: op2.content,
    };
  } else if (op1.position >= op2.position + (op2.content?.length || 1)) {
    // op1 deletes after op2
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    // Overlapping deletes - complex case
    // Adjust position based on overlap
    if (op1.position <= op2.position) {
      const overlap = Math.min(
        deleteLength - (op2.position - op1.position),
        op2.content?.length || 0
      );
      return {
        position: op1.position,
        content: (op2.content || '').substring(overlap),
      };
    } else {
      return {
        position: op2.position,
        content: op2.content,
      };
    }
  }
}

/**
 * Transform: Insert vs Replace
 */
function transformInsertReplace(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  if (op1.position <= op2.position) {
    // op1 inserts before op2's replace
    return {
      position: op2.position + op1.content.length,
      content: op2.content,
    };
  } else if (op1.position > op2.position + (op2.content?.length || 0)) {
    // op1 inserts after op2's replace
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    // op1 inserts within op2's replace range
    return {
      position: op2.position,
      content: op2.content,
    };
  }
}

/**
 * Transform: Replace vs Insert
 */
function transformReplaceInsert(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  if (op1.position + (op1.content?.length || 0) <= op2.position) {
    // op1 replaces before op2 inserts
    return {
      position: op2.position,
      content: op2.content,
    };
  } else if (op1.position >= op2.position) {
    // op1 replaces after op2 inserts, shift position
    return {
      position: op2.position + op2.content.length,
      content: op2.content,
    };
  } else {
    // op1 replaces overlaps with op2 insert point
    return {
      position: op1.position + (op1.content?.length || 0),
      content: op2.content,
    };
  }
}

/**
 * Transform: Replace vs Replace
 * Priority determines outcome when both target same content
 */
function transformReplaceReplace(
  op1: DocumentOperation,
  op2: DocumentOperation,
  priority: 'local' | 'remote'
): { position: number; content: string } {
  const op1Range = { start: op1.position, end: op1.position + (op1.content?.length || 0) };
  const op2Range = { start: op2.position, end: op2.position + (op2.content?.length || 0) };

  // No overlap
  if (op1Range.end <= op2Range.start) {
    return { position: op2.position, content: op2.content };
  }
  if (op2Range.end <= op1Range.start) {
    return {
      position: op2.position - op1.content.length + op1.content.length,
      content: op2.content,
    };
  }

  // Overlapping - use priority as tiebreaker
  if (priority === 'remote') {
    // op1 wins - op2 is discarded or merged
    return {
      position: op1.position + op1.content.length,
      content: '',
    };
  } else {
    // op2 wins
    return {
      position: op2.position,
      content: op2.content,
    };
  }
}

/**
 * Transform: Delete vs Replace
 */
function transformDeleteReplace(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  const deleteLength = op1.content?.length || 1;

  if (op1.position + deleteLength <= op2.position) {
    return {
      position: op2.position - deleteLength,
      content: op2.content,
    };
  } else if (op1.position >= op2.position + (op2.content?.length || 0)) {
    return {
      position: op2.position,
      content: op2.content,
    };
  } else {
    return {
      position: Math.max(op1.position, op2.position),
      content: op2.content,
    };
  }
}

/**
 * Transform: Replace vs Delete
 */
function transformReplaceDelete(
  op1: DocumentOperation,
  op2: DocumentOperation
): { position: number; content: string } {
  const deleteLength = op2.content?.length || 1;

  if (op1.position + (op1.content?.length || 0) <= op2.position) {
    return {
      position: op2.position,
      content: op2.content,
    };
  } else if (op1.position >= op2.position + deleteLength) {
    return {
      position: op2.position - deleteLength,
      content: op2.content,
    };
  } else {
    return {
      position: op1.position,
      content: op2.content,
    };
  }
}

/**
 * Transform a list of operations against another operation
 * Used for transforming pending client operations against received server operations
 */
export function transformAgainstMultiple(
  clientOp: DocumentOperation,
  serverOps: DocumentOperation[],
  priority: 'local' | 'remote' = 'local'
): DocumentOperation {
  let transformed = { ...clientOp };

  for (const serverOp of serverOps) {
    const result = transform(serverOp, transformed, priority);
    transformed = result;
  }

  return transformed;
}

/**
 * Apply an operation to content string
 * Modifies the content based on the operation type
 */
export function applyOperation(content: string, op: DocumentOperation): string {
  switch (op.type) {
    case 'insert': {
      return (
        content.substring(0, op.position) + op.content + content.substring(op.position)
      );
    }
    case 'delete': {
      const deleteLength = op.content?.length || 1;
      return (
        content.substring(0, op.position) +
        content.substring(op.position + deleteLength)
      );
    }
    case 'replace': {
      const deleteLength = op.content?.length || 1;
      return (
        content.substring(0, op.position) +
        op.content +
        content.substring(op.position + deleteLength)
      );
    }
    default:
      return content;
  }
}

/**
 * Apply multiple operations in sequence
 */
export function applyOperations(content: string, ops: DocumentOperation[]): string {
  return ops.reduce((acc, op) => applyOperation(acc, op), content);
}

/**
 * Validate an operation for correctness
 */
export function validateOperation(op: DocumentOperation, contentLength: number): boolean {
  // Position must be within bounds
  if (op.position < 0 || op.position > contentLength) {
    return false;
  }

  // Content must exist for insert operations
  if (op.type === 'insert' && !op.content) {
    return false;
  }

  // Position + length must not exceed content for delete/replace
  const opLength = op.content?.length || 1;
  if ((op.type === 'delete' || op.type === 'replace') && op.position + opLength > contentLength) {
    return false;
  }

  return true;
}

/**
 * Create an inverse operation (undo)
 * Returns an operation that would reverse the given operation
 */
export function inverseOperation(
  op: DocumentOperation,
  originalContent: string
): DocumentOperation | null {
  switch (op.type) {
    case 'insert': {
      // Inverse of insert is delete
      return {
        ...op,
        type: 'delete',
      };
    }
    case 'delete': {
      // Inverse of delete is insert
      return {
        ...op,
        type: 'insert',
      };
    }
    case 'replace': {
      // Inverse of replace is replace with original content
      const originalSlice = originalContent.substring(
        op.position,
        op.position + op.content.length
      );
      return {
        ...op,
        content: originalSlice,
      };
    }
    default:
      return null;
  }
}

/**
 * Compose two operations into a single operation
 * Used for combining local edits before sending to server
 */
export function composeOperations(
  op1: DocumentOperation,
  op2: DocumentOperation
): DocumentOperation | null {
  // Only compose if they're consecutive/adjacent operations
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.position + op1.content.length === op2.position) {
      return {
        ...op1,
        content: op1.content + op2.content,
        position: op1.position,
      };
    }
  }

  if (op1.type === 'delete' && op2.type === 'delete') {
    if (op1.position === op2.position) {
      return {
        ...op1,
        content: (op1.content || '') + (op2.content || ''),
        position: op1.position,
      };
    }
  }

  return null;
}

/**
 * Check if two operations conflict (affects same content range)
 */
export function operationsConflict(op1: DocumentOperation, op2: DocumentOperation): boolean {
  const op1Range = {
    start: op1.position,
    end: op1.position + (op1.type === 'insert' ? 0 : op1.content?.length || 1),
  };

  const op2Range = {
    start: op2.position,
    end: op2.position + (op2.type === 'insert' ? 0 : op2.content?.length || 1),
  };

  // Check if ranges overlap
  return !(op1Range.end <= op2Range.start || op2Range.end <= op1Range.start);
}
