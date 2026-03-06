/**
 * EventBus Interface
 * 
 * Typed, decoupled event distribution contract.
 * Modules publish events without knowing consumers.
 */

import type { DomainEvent, SystemEvent, EventType } from './DomainEvent';

export interface EventHandler<E extends DomainEvent = SystemEvent> {
  handle(event: E): Promise<void>;
}

export interface EventBus {
  publish(event: SystemEvent): Promise<void>;
  publishAll(events: SystemEvent[]): Promise<void>;
  subscribe<T extends EventType>(
    eventType: T,
    handler: EventHandler<Extract<SystemEvent, { type: T }>>
  ): () => void;
  subscribeAll(handler: EventHandler<SystemEvent>): () => void;
}
