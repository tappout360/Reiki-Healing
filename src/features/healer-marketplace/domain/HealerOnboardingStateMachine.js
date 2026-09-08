/**
 * Healer OS: 9-Stage Lifecycle State Machine & 9-Step Onboarding Gate
 * 
 * Enforces strict independent contractor classification:
 * - Healers are independent practitioners, not employees
 * - Cannot accept bookings until Active
 * - Cannot activate until all 9 onboarding steps are completed
 * - Cannot activate until Stripe Express payouts are enabled
 */

export const PractitionerLifecycleStatus = Object.freeze({
  APPLICANT: 'Applicant',
  INTERVIEW_SCHEDULED: 'InterviewScheduled',
  WAITLISTED: 'Waitlisted',
  APPROVED_PENDING_ONBOARDING: 'ApprovedPendingOnboarding',
  ONBOARDING_IN_PROGRESS: 'OnboardingInProgress',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DECLINED: 'Declined',
  DEACTIVATED: 'Deactivated'
});

export const OnboardingSteps = Object.freeze({
  STEP_1_ACCOUNT_CLAIM: 'accountClaimed',
  STEP_2_AGREEMENT_SIGNED: 'agreementSigned',
  STEP_3_HANDBOOK_ACKNOWLEDGED: 'handbookAcknowledged',
  STEP_4_TAX_ACKNOWLEDGED: 'taxAcknowledged',
  STEP_5_PRIVACY_ADDENDUM_SIGNED: 'privacyAddendumSigned',
  STEP_6_STRIPE_CONNECTED: 'stripeConnected',
  STEP_7_AVAILABILITY_CONFIGURED: 'availabilityConfigured',
  STEP_8_PROFILE_COMPLETED: 'profileCompleted',
  STEP_9_DASHBOARD_ACTIVATED: 'dashboardActivated'
});

export class HealerOnboardingStateMachine {
  constructor(initialStatus = {}, lifecycleStatus = PractitionerLifecycleStatus.APPROVED_PENDING_ONBOARDING) {
    this.lifecycleStatus = lifecycleStatus;
    this.status = {
      [OnboardingSteps.STEP_1_ACCOUNT_CLAIM]: initialStatus[OnboardingSteps.STEP_1_ACCOUNT_CLAIM] || false,
      [OnboardingSteps.STEP_2_AGREEMENT_SIGNED]: initialStatus[OnboardingSteps.STEP_2_AGREEMENT_SIGNED] || false,
      [OnboardingSteps.STEP_3_HANDBOOK_ACKNOWLEDGED]: initialStatus[OnboardingSteps.STEP_3_HANDBOOK_ACKNOWLEDGED] || false,
      [OnboardingSteps.STEP_4_TAX_ACKNOWLEDGED]: initialStatus[OnboardingSteps.STEP_4_TAX_ACKNOWLEDGED] || false,
      [OnboardingSteps.STEP_5_PRIVACY_ADDENDUM_SIGNED]: initialStatus[OnboardingSteps.STEP_5_PRIVACY_ADDENDUM_SIGNED] || false,
      [OnboardingSteps.STEP_6_STRIPE_CONNECTED]: initialStatus[OnboardingSteps.STEP_6_STRIPE_CONNECTED] || false,
      [OnboardingSteps.STEP_7_AVAILABILITY_CONFIGURED]: initialStatus[OnboardingSteps.STEP_7_AVAILABILITY_CONFIGURED] || false,
      [OnboardingSteps.STEP_8_PROFILE_COMPLETED]: initialStatus[OnboardingSteps.STEP_8_PROFILE_COMPLETED] || false,
      [OnboardingSteps.STEP_9_DASHBOARD_ACTIVATED]: initialStatus[OnboardingSteps.STEP_9_DASHBOARD_ACTIVATED] || false,
    };
  }

  completeStep(stepName) {
    if (!Object.values(OnboardingSteps).includes(stepName)) {
      throw new Error(`Unknown onboarding step: ${stepName}`);
    }
    this.status[stepName] = true;
    if (this.lifecycleStatus === PractitionerLifecycleStatus.APPROVED_PENDING_ONBOARDING) {
      this.lifecycleStatus = PractitionerLifecycleStatus.ONBOARDING_IN_PROGRESS;
    }
    if (this.isFullyOnboarded()) {
      this.lifecycleStatus = PractitionerLifecycleStatus.ACTIVE;
    }
    return this.getStatus();
  }

  getLifecycleStatus() {
    return this.lifecycleStatus;
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
      lifecycleStatus: this.lifecycleStatus,
      isFullyActivated: this.isFullyOnboarded() && this.lifecycleStatus === PractitionerLifecycleStatus.ACTIVE,
      completedCount: Object.values(this.status).filter(Boolean).length,
      totalSteps: Object.keys(this.status).length,
      missingSteps: this.getMissingSteps()
    };
  }

  assertCanAcceptBookings(stripePayoutsEnabled = false) {
    if (this.lifecycleStatus !== PractitionerLifecycleStatus.ACTIVE) {
      throw new Error(`Practitioner classification lock: Status is '${this.lifecycleStatus}'. Only Active practitioners may accept paid bookings.`);
    }
    if (!this.isFullyOnboarded()) {
      const missing = this.getMissingSteps().join(', ');
      throw new Error(`Practitioner activation lock: Onboarding incomplete. Missing steps: ${missing}`);
    }
    if (!stripePayoutsEnabled) {
      throw new Error('Practitioner activation lock: Stripe Express bank payouts are not active.');
    }
    return true;
  }
}
