import { createTipSentEvent } from '../../domain/events/DomainEvents.js';

/**
 * Driving Port / Use Case: SendTip
 * Orchestrates sending 100% tip to healer:
 * 1. Checks session invariant (must be completed)
 * 2. Invokes PaymentPort.transferFullTip (0% platform rake)
 * 3. Persists tip on Session aggregate
 * 4. Emits TipSent domain event
 */
export class SendTipUseCase {
  constructor({ sessionRepository, paymentPort }) {
    this.sessionRepo = sessionRepository;
    this.paymentPort = paymentPort;
  }

  async execute({ sessionId, tipAmount, healerStripeAccountId }) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Domain invariant check happens inside Session aggregate root
    const tip = session.addTip(tipAmount);

    // Call external payment port
    if (this.paymentPort) {
      await this.paymentPort.transferFullTip({
        sessionId: session.id,
        tipAmount: tip.amount,
        healerStripeAccountId,
      });
    }

    // Save updated session aggregate
    await this.sessionRepo.save(session);

    // Emit domain event
    const event = createTipSentEvent(session, tip);
    return { success: true, tip: tip.formatted, event };
  }
}
