/**
 * Healer OS: Onboarding State Machine & Activation Lock
 * 
 * Enforces a strict 7-step onboarding sequence before a healer can:
 * 1. Appear in the public Sanctuary healer directory
 * 2. Receive or accept paid seeker appointments
 * 3. Access client video sanctuary rooms
 */

export const OnboardingSteps = Object.freeze({
  ACCOUNT_CLAIMED: 'accountClaimed',
  AGREEMENT_SIGNED: 'agreementSigned',
  HANDBOOK_SIGNED: 'handbookSigned',
  TAX_ACKNOWLEDGED: 'taxAcknowledged',
  STRIPE_CONNECTED: 'stripeConnected',
  AVAILABILITY_CONFIGURED: 'availabilityConfigured',
  PROFILE_COMPLETED: 'profileCompleted'
});

export class HealerOnboardingStateMachine {
  constructor(initialStatus = {}) {
    this.status = {
      [OnboardingSteps.ACCOUNT_CLAIMED]: initialStatus[OnboardingSteps.ACCOUNT_CLAIMED] || false,
      [OnboardingSteps.AGREEMENT_SIGNED]: initialStatus[OnboardingSteps.AGREEMENT_SIGNED] || false,
      [OnboardingSteps.HANDBOOK_SIGNED]: initialStatus[OnboardingSteps.HANDBOOK_SIGNED] || false,
      [OnboardingSteps.TAX_ACKNOWLEDGED]: initialStatus[OnboardingSteps.TAX_ACKNOWLEDGED] || false,
      [OnboardingSteps.STRIPE_CONNECTED]: initialStatus[OnboardingSteps.STRIPE_CONNECTED] || false,
      [OnboardingSteps.AVAILABILITY_CONFIGURED]: initialStatus[OnboardingSteps.AVAILABILITY_CONFIGURED] || false,
      [OnboardingSteps.PROFILE_COMPLETED]: initialStatus[OnboardingSteps.PROFILE_COMPLETED] || false,
    };
  }

  completeStep(stepName) {
    if (!Object.values(OnboardingSteps).includes(stepName)) {
      throw new Error(`Unknown onboarding step: ${stepName}`);
    }
    this.status[stepName] = true;
    return this.getStatus();
  }

  isFullyOnboarded() {
    return Object.values(this.status).every(completed => completed === true);
  }

  getMissingSteps() {
    return Object.keys(this.status).filter(step => !this.status[step]);
  }

  getStatus() {
    return {
      ...this.status,
      isFullyActivated: this.isFullyOnboarded(),
      completedCount: Object.values(this.status).filter(Boolean).length,
      totalSteps: Object.keys(this.status).length,
      missingSteps: this.getMissingSteps()
    };
  }

  assertCanAcceptBookings(stripePayoutsEnabled = false) {
    if (!this.isFullyOnboarded()) {
      const missing = this.getMissingSteps().join(', ');
      throw new Error(`Healer activation lock: Onboarding incomplete. Missing steps: ${missing}`);
    }
    if (!stripePayoutsEnabled) {
      throw new Error('Healer activation lock: Stripe Express bank payouts are not active.');
    }
    return true;
  }
}
