/**
 * Shared Kernel - Minimal Common Types
 * 
 * Common types shared across modules.
 * Keep this minimal - no business rules here.
 */

// Re-export sub-modules
export * from './events';
export * from './http';
export * from './policies';
export * from './ports';

// Generic ID type
export interface EntityId<T extends string = string> {
  readonly value: T;
}

// Clock abstraction for testability
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class TestClock implements Clock {
  private currentTime: Date;

  constructor(initialTime: Date = new Date()) {
    this.currentTime = new Date(initialTime);
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  advance(seconds: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + seconds * 1000);
  }

  set(time: Date): void {
    this.currentTime = new Date(time);
  }
}

// Base Domain Event
export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
}

// Event Publisher Interface
export interface EventPublisher<E extends DomainEvent> {
  publish(event: E): Promise<void>;
}

// Event Subscriber Interface
export interface EventSubscriber<E extends DomainEvent> {
  handle(event: E): Promise<void>;
}

// ID Generator Interface
export interface IdGenerator {
  generate(): string;
}

// Secure ID Generator Implementation
export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Result type for operations that can fail
export type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

export function success<T>(value: T): Result<T, never> {
  return { success: true, value };
}

export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Money/Amount value object (for BTC operations)
export interface Amount {
  readonly value: number;
  readonly currency: 'BTC' | 'SAT';
}

export function btcToSat(btc: number): number {
  return Math.round(btc * 100_000_000);
}

export function satToBtc(sat: number): number {
  return sat / 100_000_000;
}
