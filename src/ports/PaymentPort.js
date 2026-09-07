/**
 * Driven Port: PaymentGatewayPort
 * Contract for processing payments and 100% tip transfers.
 */
export class PaymentPort {
  async chargeSession({ sessionId, amount, seekerEmail, healerStripeAccountId }) {
    throw new Error('PaymentPort.chargeSession must be implemented by adapter');
  }

  async transferFullTip({ sessionId, tipAmount, healerStripeAccountId }) {
    throw new Error('PaymentPort.transferFullTip must be implemented by adapter');
  }
}
