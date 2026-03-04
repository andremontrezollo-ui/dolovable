/**
 * Shared Ports
 * 
 * Common interfaces that modules can use instead of defining their own.
 * Reduces duplication across application layers.
 */

import type { DomainEvent } from '../events/DomainEvent';

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  generate(): string;
}

export interface EventPublisher<E extends DomainEvent = DomainEvent> {
  publish(event: E): Promise<void>;
}

export interface EventSubscriber<E extends DomainEvent = DomainEvent> {
  handle(event: E): Promise<void>;
}

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}
