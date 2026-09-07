import { Money } from './Money.js';

/**
 * Tip Value Object
 * Invariant: 100% directly transferred to healer (0% platform rake).
 */
export class Tip {
  constructor(amountInDollars) {
    this.money = new Money(amountInDollars);
    this.isOneHundredPercentGuaranteed = true;
    this.platformRakePercent = 0;
  }

  get amount() {
    return this.money.amount;
  }

  get formatted() {
    return this.money.formatted;
  }
}
