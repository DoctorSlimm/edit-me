/**
 * Operational Transform Algorithm Tests
 * Comprehensive test suite for conflict resolution and operation transformation
 */

import {
  transform,
  applyOperation,
  validateOperation,
  inverseOperation,
  composeOperations,
  operationsConflict,
  transformAgainstMultiple,
} from '../operational-transform';
import type { DocumentOperation } from '../types';

describe('Operational Transform Algorithm', () => {
  describe('applyOperation', () => {
    it('should insert text at specified position', () => {
      const content = 'Hello World';
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: ' Beautiful',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = applyOperation(content, operation);
      expect(result).toBe('Hello Beautiful World');
    });

    it('should delete text at specified position', () => {
      const content = 'Hello World';
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 5,
        content: ' ',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = applyOperation(content, operation);
      expect(result).toBe('HelloWorld');
    });

    it('should replace text at specified position', () => {
      const content = 'Hello World';
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'replace',
        position: 6,
        content: 'Universe',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = applyOperation(content, operation);
      expect(result).toBe('Hello Universe');
    });
  });

  describe('validateOperation', () => {
    it('should validate insert operations', () => {
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: 'test',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      expect(validateOperation(operation, 100)).toBe(true);
    });

    it('should reject operation with invalid position', () => {
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 150,
        content: 'test',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      expect(validateOperation(operation, 100)).toBe(false);
    });

    it('should reject delete with invalid range', () => {
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 90,
        content: 'thisisaverylongtext',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      expect(validateOperation(operation, 100)).toBe(false);
    });
  });

  describe('transform - Insert vs Insert', () => {
    it('should shift second insert if first is before it', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 0,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 5,
        content: 'B',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = transform(op1, op2);
      expect(result.position).toBe(6); // shifted by length of op1's content
    });

    it('should not shift second insert if first is after it', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 10,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 5,
        content: 'B',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = transform(op1, op2);
      expect(result.position).toBe(5); // no shift
    });
  });

  describe('transform - Insert vs Delete', () => {
    it('should shift delete if insert is before it', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: 'XXX',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'delete',
        position: 10,
        content: 'Y',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = transform(op1, op2);
      expect(result.position).toBe(13); // shifted by length of insert
    });
  });

  describe('transform - Delete vs Insert', () => {
    it('should shift insert if delete is before it', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 5,
        content: 'XXX',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 10,
        content: 'Y',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = transform(op1, op2);
      expect(result.position).toBe(7); // shifted by negative length of delete
    });
  });

  describe('transform - Delete vs Delete', () => {
    it('should shift second delete if first is before it', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 5,
        content: 'XX',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'delete',
        position: 10,
        content: 'Y',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const result = transform(op1, op2);
      expect(result.position).toBe(8); // shifted by negative length
    });
  });

  describe('inverseOperation', () => {
    it('should create inverse of insert', () => {
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: 'test',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const inverse = inverseOperation(operation, 'original content');
      expect(inverse).not.toBeNull();
      expect(inverse?.type).toBe('delete');
      expect(inverse?.position).toBe(5);
    });

    it('should create inverse of delete', () => {
      const operation: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 5,
        content: 'test',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const inverse = inverseOperation(operation, 'original content');
      expect(inverse).not.toBeNull();
      expect(inverse?.type).toBe('insert');
    });
  });

  describe('composeOperations', () => {
    it('should compose consecutive inserts', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 0,
        content: 'Hello',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: ' World',
        clientVersion: 1,
        serverVersion: 1,
        timestamp: Date.now(),
      };

      const composed = composeOperations(op1, op2);
      expect(composed).not.toBeNull();
      expect(composed?.content).toBe('Hello World');
    });

    it('should return null for non-composable operations', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 0,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user1',
        type: 'delete',
        position: 0,
        content: 'B',
        clientVersion: 1,
        serverVersion: 1,
        timestamp: Date.now(),
      };

      const composed = composeOperations(op1, op2);
      expect(composed).toBeNull();
    });
  });

  describe('operationsConflict', () => {
    it('should detect conflicting inserts at same position', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 5,
        content: 'B',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      expect(operationsConflict(op1, op2)).toBe(true);
    });

    it('should not mark non-overlapping operations as conflicting', () => {
      const op1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 0,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const op2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 10,
        content: 'B',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      expect(operationsConflict(op1, op2)).toBe(false);
    });
  });

  describe('transformAgainstMultiple', () => {
    it('should transform against multiple operations in sequence', () => {
      const clientOp: DocumentOperation = {
        id: 'client',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 5,
        content: 'X',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const serverOp1: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 0,
        content: 'A',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      const serverOp2: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 2,
        content: 'B',
        clientVersion: 1,
        serverVersion: 1,
        timestamp: Date.now(),
      };

      const result = transformAgainstMultiple(clientOp, [serverOp1, serverOp2]);
      // Position should be shifted by both server operations
      expect(result.position).toBeGreaterThan(5);
    });
  });

  describe('Complex collaboration scenarios', () => {
    it('should handle concurrent edits with conflict resolution', () => {
      // Two users editing the same document
      const content = 'Hello World';

      // User 1 inserts at position 6
      const user1Op: DocumentOperation = {
        id: '1',
        documentId: 'doc1',
        userId: 'user1',
        type: 'insert',
        position: 6,
        content: 'Beautiful ',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      // User 2 inserts at position 5
      const user2Op: DocumentOperation = {
        id: '2',
        documentId: 'doc1',
        userId: 'user2',
        type: 'insert',
        position: 5,
        content: ' ',
        clientVersion: 0,
        serverVersion: 0,
        timestamp: Date.now(),
      };

      // Apply user1 first
      let state = applyOperation(content, user1Op);
      expect(state).toBe('Hello Beautiful World');

      // Transform user2 against user1 and apply
      const transformed = transform(user1Op, user2Op);
      state = applyOperation(state, transformed);

      // Both inserts should be present
      expect(state).toContain('Beautiful');
      expect(state).toContain('Hello');
      expect(state).toContain('World');
    });

    it('should preserve document integrity across multiple operations', () => {
      let content = 'test';
      const operations: DocumentOperation[] = [
        {
          id: '1',
          documentId: 'doc1',
          userId: 'user1',
          type: 'insert',
          position: 0,
          content: 'Hello ',
          clientVersion: 0,
          serverVersion: 0,
          timestamp: Date.now(),
        },
        {
          id: '2',
          documentId: 'doc1',
          userId: 'user2',
          type: 'insert',
          position: 6,
          content: 'World',
          clientVersion: 1,
          serverVersion: 1,
          timestamp: Date.now(),
        },
        {
          id: '3',
          documentId: 'doc1',
          userId: 'user1',
          type: 'delete',
          position: 11,
          content: 'test',
          clientVersion: 2,
          serverVersion: 2,
          timestamp: Date.now(),
        },
      ];

      let state = content;
      for (const op of operations) {
        state = applyOperation(state, op);
      }

      expect(state).toBe('Hello World');
    });
  });
});
