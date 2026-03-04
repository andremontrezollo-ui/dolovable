/**
 * Base Domain Event Types
 * 
 * All domain events across modules extend this base.
 * Events are the primary inter-module communication mechanism.
 */

export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
}

/**
 * All known event types in the system.
 * Modules register their events here for type safety.
 */
export type SystemEvent =
  // Address Generator
  | { type: 'ADDRESS_TOKEN_EMITTED'; tokenId: string; namespace: string; expiresAt: Date; timestamp: Date }
  | { type: 'ADDRESS_TOKEN_RESOLVED'; tokenId: string; timestamp: Date }
  | { type: 'ADDRESS_TOKEN_EXPIRED'; tokenId: string; reason: 'ttl' | 'usage' | 'manual'; timestamp: Date }
  // Blockchain Monitor
  | { type: 'BLOCK_OBSERVED'; height: { value: number }; transactionCount: number; timestamp: Date }
  | { type: 'TRANSACTION_CONFIRMED'; txId: { hash: string }; confirmations: { count: number; isConfirmed: boolean }; timestamp: Date }
  | { type: 'FEE_ESTIMATE_UPDATED'; satPerVbyte: number; priority: 'low' | 'medium' | 'high'; timestamp: Date }
  // Liquidity Pool
  | { type: 'LIQUIDITY_RESERVED'; obligationId: string; amount: number; timestamp: Date }
  | { type: 'LIQUIDITY_RELEASED'; obligationId: string; amount: number; reason: 'fulfilled' | 'expired' | 'cancelled'; timestamp: Date }
  | { type: 'POOL_HEALTH_CHANGED'; previousStatus: string; newStatus: string; utilizationRate: number; timestamp: Date }
  // Payment Scheduler
  | { type: 'PAYMENT_PLANNED'; paymentId: string; scheduledFor: Date; windowStart: Date; windowEnd: Date; timestamp: Date }
  | { type: 'PAYMENT_BATCH_CREATED'; batchId: string; paymentCount: number; timestamp: Date }
  | { type: 'PAYMENT_EXECUTED'; paymentId: string; batchId?: string; success: boolean; timestamp: Date }
  // Log Minimizer
  | { type: 'LOG_ENTRY_CREATED'; entryId: string; dataClass: string; expiresAt: Date; timestamp: Date }
  | { type: 'LOG_ENTRY_REDACTED'; entryId: string; reason: 'policy' | 'manual' | 'ttl'; timestamp: Date }
  | { type: 'COMPLIANCE_REPORT_GENERATED'; reportId: string; entriesProcessed: number; entriesRedacted: number; timestamp: Date }
  // Session Management
  | { type: 'SESSION_CREATED'; sessionId: string; expiresAt: Date; timestamp: Date }
  | { type: 'SESSION_EXPIRED'; sessionId: string; timestamp: Date };

export type EventType = SystemEvent['type'];
