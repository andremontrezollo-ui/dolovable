/**
 * In-Memory Event Bus Implementation
 * 
 * Simple in-process event distribution for development and testing.
 */

import type { SystemEvent, EventType } from './DomainEvent';
import type { EventBus, EventHandler } from './EventBus';

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler<any>>>();
  private globalHandlers = new Set<EventHandler<SystemEvent>>();
  private eventLog: SystemEvent[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 1000) {
    this.maxLogSize = maxLogSize;
  }

  async publish(event: SystemEvent): Promise<void> {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

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

    for (const handler of this.globalHandlers) {
      try {
        await handler.handle(event);
      } catch (err) {
        console.error(`[EventBus] Global handler error:`, err);
      }
    }
  }

  async publishAll(events: SystemEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
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
    return () => { this.handlers.get(eventType)?.delete(handler); };
  }

  subscribeAll(handler: EventHandler<SystemEvent>): () => void {
    this.globalHandlers.add(handler);
    return () => { this.globalHandlers.delete(handler); };
  }

  getEventLog(): readonly SystemEvent[] {
    return [...this.eventLog];
  }

  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.eventLog = [];
  }
}
