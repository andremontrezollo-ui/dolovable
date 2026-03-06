/**
 * MarkPaymentExecuted Use Case
 * Emits PAYMENT_EXECUTED, consumed by log-minimizer.
 */

import type { ScheduledPaymentRepository } from '../ports/scheduled-payment-repository.port';
import type { PaymentEventPublisher } from '../ports/event-publisher.port';
import type { PaymentClock } from '../ports/clock.port';
import { createPaymentExecutedEvent } from '../../domain/events/payment-executed.event';
import { PaymentAlreadyExecutedError } from '../../domain/errors/payment-already-executed.error';

export class MarkPaymentExecutedUseCase {
  constructor(
    private readonly repo: ScheduledPaymentRepository,
    private readonly publisher: PaymentEventPublisher,
    private readonly clock: PaymentClock,
  ) {}

  async execute(paymentId: string, success: boolean): Promise<void> {
    const payment = await this.repo.findById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    if (payment.status === 'executed') throw new PaymentAlreadyExecutedError(paymentId);

    if (success) {
      payment.markExecuted(this.clock.now());
    } else {
      payment.markFailed();
    }

    await this.repo.save(payment);
    await this.publisher.publish(createPaymentExecutedEvent(paymentId, success));
  }
}
