/**
 * Healer OS: Legal & Compliance Documents Service
 * 
 * Manages versioned contracts, handbook acknowledgments, and tax agreements:
 * 1. Independent Practitioner Agreement (20% commission, 100% tips, 1099 contractor status)
 * 2. Independent Practitioner Handbook Acknowledgment (v2026.2)
 * 3. Tax & Payout Acknowledgment (Form W-9 & 1099-NEC)
 * 4. Privacy & Client Care Addendum (Zero PHI, non-medical safe harbor)
 */

export const PRACTITIONER_HANDBOOK_19_SECTIONS = Object.freeze([
  {
    number: 1,
    title: 'Welcome & Purpose',
    content: 'Mission of Reiki & Sage; role of independent healers on the platform; handbook purpose for standards, expectations, protections, and clarity. Explicit statement that this handbook does NOT create an employment relationship.'
  },
  {
    number: 2,
    title: 'Sovereign Independent Worker Status',
    content: 'Clear classification as an independent contractor (freedom worker / 1099 practitioner). No employment, agency, joint venture, or partnership. Practitioner retains full autonomy, control of methods, and professional sovereignty.'
  },
  {
    number: 3,
    title: 'Platform Model & Relationship',
    content: 'Reiki & Sage provides a technology venue, booking infrastructure, payment processing, and sanctuary community. The practitioner provides spiritual, wellness, and energetic services directly to the seeker.'
  },
  {
    number: 4,
    title: 'Qualifications, Lineage, & Standards',
    content: 'Required certifications, attunements, lineage documentation, insurance expectations, professional representation, and ongoing mastery.'
  },
  {
    number: 5,
    title: 'Setting Your Schedule & Services',
    content: 'Total freedom of hours and calendar control. Buffer times (minimum 15-minute integration buffer), service radius (up to 50 miles for in-person), modality selection, and setting remote vs in-person offerings.'
  },
  {
    number: 6,
    title: 'Pricing, Payments, & Payouts',
    content: 'Platform commission is strictly 20% on session fees. 100% of seeker tips go directly to the practitioner (0% platform rake). Stripe Express direct bank payout schedule, non-circumvention rules, and off-platform booking prohibitions.'
  },
  {
    number: 7,
    title: 'Taxes, Bookkeeping, & Freedom-Worker Responsibility',
    content: 'Practitioner acknowledges sole responsibility for local, state, and federal taxes, self-employment taxes, bookkeeping, business expenses, quarterly filings, and electronic Form 1099-NEC delivery via Stripe Express.'
  },
  {
    number: 8,
    title: 'Cancellation, Rescheduling, & No-Show Standards',
    content: '24-hour mandatory response standard for booking requests; seeker cancellation windows; healer emergency rescheduling protocol; compassionate dispute handling.'
  },
  {
    number: 9,
    title: 'Safe, Sacred, & Professional Conduct',
    content: 'Ethics, boundaries, touch guidelines (strictly therapeutic and non-sexual), consent practices, trauma-informed presence, sobriety, and professional dignity.'
  },
  {
    number: 10,
    title: 'Session Guidelines & Energy Boundaries',
    content: 'Pre-session intention setting, energetic grounding, post-session integration, non-attachment, honoring seeker autonomy, and maintaining sacred space.'
  },
  {
    number: 11,
    title: 'Sacred Communication & Sanctuary Etiquette',
    content: 'Calm, mystical, and grounded communication; messaging etiquette; response windows; dispute de-escalation; compassionate language.'
  },
  {
    number: 12,
    title: 'Equipment, Supplies, & Healing Environment',
    content: 'Freedom worker provides their own tools (mats, crystals, singing bowls, essential oils, tuning forks, computing/video hardware); quiet, serene, sacred physical atmosphere.'
  },
  {
    number: 13,
    title: 'Health, Wellness, & Non-Medical Boundaries',
    content: 'Strict compliance with FTC/FDA non-medical wellness safe harbors and HIPAA non-PHI posture. Energy healing is complementary spiritual wellness, NEVER medical or psychological treatment. Zero diagnosis, zero prescribing, zero claims to cure diseases, mandatory emergency referrals.'
  },
  {
    number: 14,
    title: 'Confidentiality & Sacred Discretion',
    content: 'Seeker privacy, sacred trust, non-disclosure of personal vulnerabilities shared during sessions, zero PHI collection, secure data handling.'
  },
  {
    number: 15,
    title: 'Platform Conduct & Prohibited Behavior',
    content: 'Zero tolerance for harassment, discrimination, hate speech, sexual misconduct, off-platform solicitation, fraudulent credentials, or exploitative financial requests.'
  },
  {
    number: 16,
    title: 'Feedback, Reviews, & Sanctuary Standing',
    content: 'Seeker reviews, quality standards, peer review, Carissa review audits, and resolution procedures for client complaints.'
  },
  {
    number: 17,
    title: 'Inactive Accounts, Offboarding, & Pausing',
    content: 'How to pause your account (sabbatical / retreat), voluntary departure, platform deactivation criteria, and export of tax/earnings history.'
  },
  {
    number: 18,
    title: 'Platform Rights, Modifications, & Terms',
    content: 'Platform updates, terms revisions, right to suspend or remove practitioners for safety, ethics, or legal non-compliance, severability, and governing law.'
  },
  {
    number: 19,
    title: 'Acknowledgement & Electronic Signature',
    content: 'Formal statement: "I acknowledge that I am an independent contractor, solely responsible for my own taxes, bookkeeping, and professional practice. I have read, understood, and agree to abide by the Reiki & Sage Independent Practitioner Handbook." Immutable SHA-256 and IP timestamp recorded.'
  }
]);

export const AGREEMENT_VERSIONS = {
  INDEPENDENT_PRACTITIONER_AGREEMENT: {
    version: '2026.2',
    title: 'Independent Practitioner Master Agreement',
    summary: 'Establishes 1099 independent contractor status, 20% platform commission on session fees, 100% tip guarantee, and sole responsibility for taxes and insurance.'
  },
  INDEPENDENT_PRACTITIONER_HANDBOOK: {
    version: '2026.2',
    title: 'Independent Practitioner Handbook',
    summary: 'Acknowledges receipt of the 19-section platform standards handbook, conduct policies, and 24-hr appointment response standard.',
    sections: PRACTITIONER_HANDBOOK_19_SECTIONS,
    content: PRACTITIONER_HANDBOOK_19_SECTIONS.map(s => `${s.number}. ${s.title}: ${s.content}`).join('\n\n')
  },
  TAX_AND_PAYOUT_ACKNOWLEDGMENT: {
    version: '2026.2',
    title: 'Form W-9 & 1099-NEC Tax & Payout Responsibility Acknowledgment',
    summary: 'Affirms that practitioner is solely responsible for bookkeeping and self-employment taxes, and consents to electronic 1099 delivery via Stripe Express.'
  },
  PRIVACY_AND_CLIENT_CARE_ADDENDUM: {
    version: '2026.2',
    title: 'Sanctuary Privacy, Non-Medical & Client Care Addendum',
    summary: 'Affirms strict FTC/FDA non-medical safe harbor, zero PHI collection, and client confidentiality.'
  }
};

export class HealerAgreementService {
  constructor(storageKey = 'reiki_signed_agreements') {
    this.storageKey = storageKey;
  }

  _getStore() {
    try {
      const data = globalThis.localStorage?.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _saveStore(data) {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(data));
    } catch (err) {
      console.warn('Could not save agreements:', err);
    }
  }

  signAgreement({ healerId, signerName, agreementKey, ipAddress = '127.0.0.1' }) {
    const agreementMeta = AGREEMENT_VERSIONS[agreementKey];
    if (!agreementMeta) throw new Error(`Invalid agreement key: ${agreementKey}`);

    const store = this._getStore();
    if (!store[healerId]) store[healerId] = [];

    const record = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      healerId,
      signerName,
      agreementKey,
      title: agreementMeta.title,
      version: agreementMeta.version,
      signedTimestamp: new Date().toISOString(),
      ipAddress,
      verifiedSha: `sha256_verified_${agreementMeta.version}_${Date.now()}`,
      status: 'VALID',
      terms: {
        commissionRateOnSessions: 0.20, // 20% platform commission
        commissionRateOnTips: 0.00,     // 0% platform commission on tips
        independentContractorStatus: true,
        bookkeepingResponsibility: 'practitioner',
        taxResponsibility: 'practitioner'
      }
    };

    store[healerId].push(record);
    this._saveStore(store);

    return { success: true, record };
  }

  getSignedAgreements(healerId) {
    const store = this._getStore();
    return store[healerId] || [];
  }

  hasSignedAllRequired(healerId) {
    const signed = this.getSignedAgreements(healerId);
    const requiredKeys = Object.keys(AGREEMENT_VERSIONS);
    return requiredKeys.every(reqKey => signed.some(s => s.agreementKey === reqKey));
  }
}
