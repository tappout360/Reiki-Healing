/**
 * Money Value Object
 * Immutable amount + currency representation.
 */
export class Money {
  constructor(amountInDollars, currency = 'USD') {
    const num = Number(amountInDollars);
    if (isNaN(num) || num < 0) {
      throw new Error('Money amount must be a positive number');
    }
    this.amount = Number(num.toFixed(2));
    this.currency = currency.toUpperCase();
  }

  get cents() {
    return Math.round(this.amount * 100);
  }

  get formatted() {
    return `$${this.amount.toFixed(2)}`;
  }

  equals(other) {
    return other instanceof Money && this.amount === other.amount && this.currency === other.currency;
  }
}
