/**
 * ConfirmDeposit Use Case
 */

import type { ObservedTransactionRepository } from '../ports/observed-transaction-repository.port';
import type { BlockchainEventPublisher } from '../ports/event-publisher.port';
import type { BlockchainClock } from '../ports/clock.port';
import type { DepositConfirmationDto } from '../dtos/deposit-confirmation.dto';
import { ConfirmationCount } from '../../domain/value-objects/confirmation-count.vo';
import { ConfirmationThresholdPolicy } from '../../domain/policies/confirmation-threshold.policy';
import { createDepositConfirmedEvent } from '../../domain/events/deposit-confirmed.event';

export class ConfirmDepositUseCase {
  private readonly policy = new ConfirmationThresholdPolicy();

  constructor(
    private readonly repo: ObservedTransactionRepository,
    private readonly publisher: BlockchainEventPublisher,
    private readonly clock: BlockchainClock,
  ) {}

  async execute(txId: string, confirmations: number): Promise<DepositConfirmationDto> {
    const tx = await this.repo.findByTxId(txId);
    if (!tx) throw new Error(`Transaction ${txId} not found`);

    const result = this.policy.evaluate({ confirmations, amount: tx.amount });
    const now = this.clock.now();

    tx.updateConfirmations(ConfirmationCount.create(confirmations), now);

    if (result.isConfirmed && tx.status !== 'confirmed') {
      tx.markConfirmed(now);
      await this.publisher.publish(createDepositConfirmedEvent(txId, confirmations));
    }

    await this.repo.save(tx);

    return {
      txId,
      confirmations,
      isConfirmed: result.isConfirmed,
      requiredConfirmations: result.requiredConfirmations,
      ...(result.isConfirmed ? { confirmedAt: now.toISOString() } : {}),
    };
  }
}
