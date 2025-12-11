/**
 * In-memory Counter Module
 * Provides a simple counter with increment, decrement, and reset operations
 * State persists in-memory only and resets on application restart
 * Designed to handle up to 100 concurrent updates per second
 */

/**
 * Counter state - single integer stored in-memory
 * Range: JavaScript safe integers (−2^53 + 1 to 2^53 − 1)
 */
let counterState: number = 0;

/**
 * Get the current counter value
 * @returns The current counter value
 */
export function getCounter(): number {
  return counterState;
}

/**
 * Increment the counter by 1
 * @returns The new counter value after increment
 * @throws Error if operation would exceed safe integer bounds
 */
export function increment(): number {
  // Check if incrementing would exceed safe integer bounds
  if (counterState >= Number.MAX_SAFE_INTEGER) {
    throw new Error('Counter would exceed maximum safe integer value');
  }
  counterState += 1;
  return counterState;
}

/**
 * Decrement the counter by 1
 * @returns The new counter value after decrement
 * @throws Error if counter would go below 0 (business logic constraint)
 */
export function decrement(): number {
  // Constraint: Counter should not go below 0 (for UI use cases like cart items)
  if (counterState <= 0) {
    throw new Error('Counter cannot go below 0');
  }
  counterState -= 1;
  return counterState;
}

/**
 * Reset the counter to 0
 * @returns The reset value (always 0)
 */
export function reset(): number {
  counterState = 0;
  return counterState;
}

/**
 * Set the counter to a specific value
 * Used primarily for testing and internal state management
 * @param value The value to set the counter to
 * @throws Error if value is not a valid integer or out of range
 */
export function setCounter(value: number): number {
  // Validate input
  if (!Number.isInteger(value)) {
    throw new Error('Counter value must be an integer');
  }
  if (value < 0) {
    throw new Error('Counter value cannot be negative');
  }
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new Error('Counter value exceeds maximum safe integer');
  }
  counterState = value;
  return counterState;
}
