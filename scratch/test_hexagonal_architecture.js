import { Session, SessionStatus } from '../src/domain/sessions/Session.js';
import { Money } from '../src/domain/payments/Money.js';
import { Tip } from '../src/domain/payments/Tip.js';
import { SendTipUseCase } from '../src/application/use-cases/SendTipUseCase.js';
import { BookSessionUseCase } from '../src/application/use-cases/BookSessionUseCase.js';
import { CompleteSessionUseCase } from '../src/application/use-cases/CompleteSessionUseCase.js';
import { LocalSessionRepository } from '../src/adapters/persistence/LocalSessionRepository.js';

// Polyfill localStorage in Node.js test runner if absent
if (typeof localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

console.log('================================================================');
console.log('🔷 HEXAGONAL ARCHITECTURE & DOMAIN INVARIANTS TEST SUITE');
console.log('================================================================');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // Test 1: Value Object Money
  const m1 = new Money(88.00);
  const m2 = new Money(88);
  assert(m1.cents === 8800, 'Money converts accurately to integer cents (8800)');
  assert(m1.formatted === '$88.00', 'Money formats properly ($88.00)');
  assert(m1.equals(m2), 'Money value objects are equal when amounts match');

  // Test 2: Tip Invariant (100% to Healer, 0% platform fee)
  const tip = new Tip(20);
  assert(tip.amount === 20, 'Tip amount equals $20.00');
  assert(tip.platformRakePercent === 0, 'Tip invariant: 0% platform rake enforced');
  assert(tip.isOneHundredPercentGuaranteed === true, '100% Healer tip guarantee flag is active');

  // Test 3: Session Lifecycle Invariants
  const session = new Session({
    id: 'ses_test_101',
    healerId: 'healer_carissa',
    seekerId: 'seeker_jason',
    price: 88,
  });

  assert(session.status === SessionStatus.SCHEDULED, 'Initial session status is SCHEDULED');

  let tipErrorThrown = false;
  try {
    session.addTip(25);
  } catch {
    tipErrorThrown = true;
  }
  assert(tipErrorThrown, 'Invariant enforced: Cannot tip before session is COMPLETED');

  session.markAsPaid();
  assert(session.status === SessionStatus.PAID, 'Session advances to PAID');

  session.startLive();
  assert(session.status === SessionStatus.LIVE, 'Session enters LIVE video sanctuary');

  session.complete();
  assert(session.status === SessionStatus.COMPLETED, 'Session marked as COMPLETED');

  // Now tipping should succeed
  session.addTip(25);
  assert(session.tip !== null && session.tip.amount === 25, 'Tip successfully granted on completed session');

  // Test 4: Hexagonal Ports & Adapter Use Case (SendTipUseCase)
  const sessionRepo = new LocalSessionRepository('test_hexagonal_sessions');
  await sessionRepo.save(session);

  let mockPaymentPortCalled = false;
  let transferredAmount = 0;
  const mockPaymentPort = {
    async transferFullTip({ tipAmount }) {
      mockPaymentPortCalled = true;
      transferredAmount = tipAmount;
      return { success: true };
    }
  };

  const sendTipUseCase = new SendTipUseCase({
    sessionRepository: sessionRepo,
    paymentPort: mockPaymentPort,
  });

  const tipResult = await sendTipUseCase.execute({
    sessionId: 'ses_test_101',
    tipAmount: 50,
    healerStripeAccountId: 'acct_healer_123',
  });

  assert(tipResult.success === true, 'SendTipUseCase executed successfully');
  assert(mockPaymentPortCalled === true, 'PaymentPort was invoked via Adapter boundary');
  assert(transferredAmount === 50, '100% of tip ($50.00) routed to healer destination account');
  assert(tipResult.event.eventName === 'TIP_SENT', 'Domain Event TIP_SENT was emitted');

  // Test 5: Booking Use Case
  const bookSessionUseCase = new BookSessionUseCase({ sessionRepository: sessionRepo });
  const bookResult = await bookSessionUseCase.execute({
    healerId: 'healer_carissa',
    seekerId: 'seeker_new',
    serviceType: 'onsite',
    price: 150,
    date: '2026-09-15',
    timeSlot: '2:00 PM',
  });

  assert(bookResult.success === true, 'BookSessionUseCase created session');
  assert(bookResult.session.price.amount === 150, 'Session price preserved as Money value object ($150.00)');

  // Test 6: Complete Session Use Case
  const completeSessionUseCase = new CompleteSessionUseCase({ sessionRepository: sessionRepo });
  bookResult.session.markAsPaid();
  await sessionRepo.save(bookResult.session);
  const completeResult = await completeSessionUseCase.execute({ sessionId: bookResult.session.id });
  assert(completeResult.success === true, 'CompleteSessionUseCase completed session');
  assert(completeResult.event.eventName === 'SESSION_COMPLETED', 'SESSION_COMPLETED event emitted');

  console.log('================================================================');
  console.log(`📊 HEXAGONAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
