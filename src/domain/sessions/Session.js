import { Money } from '../payments/Money.js';
import { Tip } from '../payments/Tip.js';

export const SessionStatus = Object.freeze({
  SCHEDULED: 'scheduled',
  PAID: 'paid',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

/**
 * Session Aggregate Root
 * Protects domain invariants:
 * - Cannot join live if not paid (for paid sessions)
 * - Tip can ONLY be added after status is COMPLETED
 * - Rating (1-5) can ONLY be given after completion
 */
export class Session {
  constructor({
    id,
    healerId,
    seekerId,
    serviceType = 'live',
    price = 88,
    status = SessionStatus.SCHEDULED,
    date,
    timeSlot,
    rating = null,
    tip = null,
    createdAt = new Date().toISOString()
  }) {
    if (!id) throw new Error('Session must have an id');
    if (!healerId) throw new Error('Session must have a healerId');
    if (!seekerId) throw new Error('Session must have a seekerId');

    this.id = id;
    this.healerId = healerId;
    this.seekerId = seekerId;
    this.serviceType = serviceType; // 'live' | 'onsite'
    this.price = new Money(price);
    this.status = status;
    this.date = date;
    this.timeSlot = timeSlot;
    this.rating = rating;
    this.tip = tip ? new Tip(tip.amount || tip) : null;
    this.createdAt = createdAt;
  }

  markAsPaid() {
    if (this.status !== SessionStatus.SCHEDULED) {
      throw new Error(`Cannot pay for session in status: ${this.status}`);
    }
    this.status = SessionStatus.PAID;
  }

  startLive() {
    if (this.status !== SessionStatus.PAID) {
      throw new Error('Cannot start live video portal before session is paid');
    }
    this.status = SessionStatus.LIVE;
  }

  complete() {
    if (this.status !== SessionStatus.LIVE && this.status !== SessionStatus.PAID) {
      throw new Error(`Cannot complete session from status: ${this.status}`);
    }
    this.status = SessionStatus.COMPLETED;
  }

  addTip(amountInDollars) {
    if (this.status !== SessionStatus.COMPLETED) {
      throw new Error('Invariant violated: Tips can only be granted after session is completed');
    }
    this.tip = new Tip(amountInDollars);
    return this.tip;
  }

  rate(ratingValue) {
    const num = Number(ratingValue);
    if (isNaN(num) || num < 1 || num > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    if (this.status !== SessionStatus.COMPLETED) {
      throw new Error('Invariant violated: Rating can only be submitted after session completion');
    }
    this.rating = Math.round(num);
  }
}
