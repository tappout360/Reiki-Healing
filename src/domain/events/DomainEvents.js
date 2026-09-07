export class DomainEvent {
  constructor(name, payload) {
    this.eventName = name;
    this.payload = payload;
    this.occurredAt = new Date().toISOString();
  }
}

export const createSessionCompletedEvent = (session) => 
  new DomainEvent('SESSION_COMPLETED', { sessionId: session.id, healerId: session.healerId, seekerId: session.seekerId });

export const createTipSentEvent = (session, tip) => 
  new DomainEvent('TIP_SENT', { sessionId: session.id, healerId: session.healerId, amount: tip.amount, formatted: tip.formatted });

export const createHealerApprovedEvent = (healerId, approvedBy) => 
  new DomainEvent('HEALER_APPROVED', { healerId, approvedBy });
