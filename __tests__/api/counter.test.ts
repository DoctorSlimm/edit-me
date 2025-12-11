/**
 * Integration tests for Counter API endpoints
 * Tests the REST API routes and their integration with the counter module
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { GET as getCounterRoute } from '@/app/api/counter/route';
import { POST as incrementRoute } from '@/app/api/counter/increment/route';
import { POST as decrementRoute } from '@/app/api/counter/decrement/route';
import { POST as resetRoute } from '@/app/api/counter/reset/route';
import { setCounter, reset } from '@/app/lib/counter';
import { NextRequest } from 'next/server';

// Helper to create a mock NextRequest
function createMockRequest(method: string = 'GET'): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/counter'), {
    method,
  });
}

describe('Counter API Endpoints', () => {
  beforeEach(async () => {
    // Reset counter before each test
    reset();
  });

  describe('GET /api/counter', () => {
    it('should return current counter value', async () => {
      const request = createMockRequest('GET');
      const response = await getCounterRoute(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('value');
      expect(json.value).toBe(0);
    });

    it('should return updated value after increment', async () => {
      setCounter(5);
      const request = createMockRequest('GET');
      const response = await getCounterRoute(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.value).toBe(5);
    });

    it('should return correct Content-Type header', async () => {
      const request = createMockRequest('GET');
      const response = await getCounterRoute(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });
  });

  describe('POST /api/counter/increment', () => {
    it('should increment counter and return new value', async () => {
      const request = createMockRequest('POST');
      const response = await incrementRoute(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.value).toBe(1);
    });

    it('should increment multiple times', async () => {
      for (let i = 0; i < 3; i++) {
        const request = createMockRequest('POST');
        const response = await incrementRoute(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.value).toBe(i + 1);
      }
    });

    it('should return 400 when exceeding safe integer limit', async () => {
      setCounter(Number.MAX_SAFE_INTEGER);
      const request = createMockRequest('POST');
      const response = await incrementRoute(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
      expect(json.error).toContain('maximum safe integer');
    });

    it('should return correct Content-Type header', async () => {
      const request = createMockRequest('POST');
      const response = await incrementRoute(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('POST /api/counter/decrement', () => {
    it('should decrement counter and return new value', async () => {
      setCounter(5);
      const request = createMockRequest('POST');
      const response = await decrementRoute(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.value).toBe(4);
    });

    it('should decrement multiple times', async () => {
      setCounter(5);
      for (let i = 0; i < 3; i++) {
        const request = createMockRequest('POST');
        const response = await decrementRoute(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.value).toBe(5 - (i + 1));
      }
    });

    it('should return 400 when counter is already at 0', async () => {
      setCounter(0);
      const request = createMockRequest('POST');
      const response = await decrementRoute(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
      expect(json.error).toContain('cannot go below 0');
    });

    it('should return correct Content-Type header', async () => {
      setCounter(5);
      const request = createMockRequest('POST');
      const response = await decrementRoute(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('POST /api/counter/reset', () => {
    it('should reset counter to 0', async () => {
      setCounter(42);
      const request = createMockRequest('POST');
      const response = await resetRoute(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.value).toBe(0);
    });

    it('should always return 0', async () => {
      setCounter(999);
      const request = createMockRequest('POST');
      const response = await resetRoute(request);
      const json = await response.json();

      expect(json.value).toBe(0);
    });

    it('should be idempotent', async () => {
      setCounter(42);

      // First reset
      let request = createMockRequest('POST');
      let response = await resetRoute(request);
      let json = await response.json();
      expect(json.value).toBe(0);

      // Second reset should also return 0
      request = createMockRequest('POST');
      response = await resetRoute(request);
      json = await response.json();
      expect(json.value).toBe(0);
    });

    it('should return correct Content-Type header', async () => {
      const request = createMockRequest('POST');
      const response = await resetRoute(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Sequential API Calls', () => {
    it('should maintain state across sequential requests', async () => {
      // GET initial value
      let request = createMockRequest('GET');
      let response = await getCounterRoute(request);
      let json = await response.json();
      expect(json.value).toBe(0);

      // INCREMENT
      request = createMockRequest('POST');
      response = await incrementRoute(request);
      json = await response.json();
      expect(json.value).toBe(1);

      // INCREMENT again
      request = createMockRequest('POST');
      response = await incrementRoute(request);
      json = await response.json();
      expect(json.value).toBe(2);

      // GET to verify
      request = createMockRequest('GET');
      response = await getCounterRoute(request);
      json = await response.json();
      expect(json.value).toBe(2);

      // DECREMENT
      request = createMockRequest('POST');
      response = await decrementRoute(request);
      json = await response.json();
      expect(json.value).toBe(1);

      // RESET
      request = createMockRequest('POST');
      response = await resetRoute(request);
      json = await response.json();
      expect(json.value).toBe(0);

      // Verify reset
      request = createMockRequest('GET');
      response = await getCounterRoute(request);
      json = await response.json();
      expect(json.value).toBe(0);
    });

    it('should handle rapid sequential increments', async () => {
      for (let i = 1; i <= 10; i++) {
        const request = createMockRequest('POST');
        const response = await incrementRoute(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.value).toBe(i);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // This test ensures the API doesn't crash on edge cases
      setCounter(Number.MAX_SAFE_INTEGER);
      const request = createMockRequest('POST');
      const response = await incrementRoute(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });
});
