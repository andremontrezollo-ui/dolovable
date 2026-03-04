/**
 * Session TTL Policy
 * 
 * Pure business rule: determines if a session/token has expired
 * and calculates valid TTL windows.
 */

import type { ExplainablePolicy } from '../../../../shared/policies';

export interface TTLInput {
  createdAt: Date;
  expiresAt: Date;
  currentTime: Date;
}

export interface TTLResult {
  isExpired: boolean;
  remainingSeconds: number;
  totalTTLSeconds: number;
}

export class SessionTTLPolicy implements ExplainablePolicy<TTLInput, TTLResult> {
  constructor(
    private readonly maxTTLSeconds: number = 3600,
    private readonly gracePeriodSeconds: number = 0
  ) {}

  evaluate(input: TTLInput): TTLResult {
    const totalTTL = (input.expiresAt.getTime() - input.createdAt.getTime()) / 1000;
    const remaining = (input.expiresAt.getTime() - input.currentTime.getTime()) / 1000 + this.gracePeriodSeconds;

    return {
      isExpired: remaining <= 0,
      remainingSeconds: Math.max(0, Math.round(remaining)),
      totalTTLSeconds: Math.round(totalTTL),
    };
  }

  explain(input: TTLInput): string {
    const result = this.evaluate(input);
    if (result.isExpired) {
      return `Session expired. TTL was ${result.totalTTLSeconds}s.`;
    }
    return `Session active. ${result.remainingSeconds}s remaining of ${result.totalTTLSeconds}s total.`;
  }

  /** Validate that a proposed TTL is within bounds */
  isValidTTL(ttlSeconds: number): boolean {
    return ttlSeconds > 0 && ttlSeconds <= this.maxTTLSeconds;
  }
}
