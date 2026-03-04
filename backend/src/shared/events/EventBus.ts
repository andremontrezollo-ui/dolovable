/**
 * Cross-Module Event Bus
 * 
 * Typed, decoupled event distribution.
 * Modules publish events without knowing consumers.
 */

import type { DomainEvent, SystemEvent, EventType } from './DomainEvent';

export interface EventHandler<E extends DomainEvent = SystemEvent> {
  handle(event: E): Promise<void>;
}

export interface EventBus {
  publish(event: SystemEvent): Promise<void>;
  subscribe<T extends EventType>(
    eventType: T,
    handler: EventHandler<Extract<SystemEvent, { type: T }>>
  ): () => void;
  subscribeAll(handler: EventHandler<SystemEvent>): () => void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler<any>>>();
  private globalHandlers = new Set<EventHandler<SystemEvent>>();
  private eventLog: SystemEvent[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 1000) {
    this.maxLogSize = maxLogSize;
  }

  async publish(event: SystemEvent): Promise<void> {
    // Append to audit log (bounded)
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    // Notify type-specific handlers
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          await handler.handle(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${event.type}:`, err);
        }
      }
    }

    // Notify global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler.handle(event);
      } catch (err) {
        console.error(`[EventBus] Global handler error:`, err);
      }
    }
  }

  subscribe<T extends EventType>(
    eventType: T,
    handler: EventHandler<Extract<SystemEvent, { type: T }>>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  subscribeAll(handler: EventHandler<SystemEvent>): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /** Read-only access to event log for testing/auditing */
  getEventLog(): readonly SystemEvent[] {
    return [...this.eventLog];
  }

  /** Test helper */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.eventLog = [];
  }
}
