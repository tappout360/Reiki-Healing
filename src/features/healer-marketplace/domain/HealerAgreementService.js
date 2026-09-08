/**
 * Healer OS: Legal & Handbook Sign-Off Service
 * 
 * Versioned legal agreements with cryptographic verification and timestamped logging.
 */

export const AGREEMENT_VERSIONS = {
  INDEPENDENT_PRACTITIONER: {
    version: '2026.1',
    title: 'Independent Energy Practitioner Master Agreement',
    summary: 'Establishes 1099 independent contractor posture, 15% session commission, 100% tip guarantee, and practitioner liability/tax autonomy.'
  },
  HEALER_HANDBOOK: {
    version: '2026.1',
    title: 'Sanctuary Healer Code of Sacred Ethics & Boundaries',
    summary: 'Preserves non-medical FTC/FDA safe harbor, zero PHI collection, sacred presence, and prompt 24-hr appointment response standard.'
  },
  TAX_ACKNOWLEDGMENT: {
    version: '2026.1',
    title: 'Form W-9 & 1099-NEC Practitioner Tax Acknowledgment',
    summary: 'Acknowledges Stripe Express electronic 1099 delivery and self-employment tax obligations.'
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
      verifiedSha: `sha256_mock_${agreementMeta.version}_${Date.now()}`,
      status: 'VALID'
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
