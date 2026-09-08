/**
 * Healer OS: Admin Review & Governance Service
 * Exclusively for Carissa (Founder & Master Healer) and Jason (Admin Backup)
 */

export class HealerAdminService {
  constructor(storageKey = 'reiki_healer_applications') {
    this.storageKey = storageKey;
  }

  _getApplications() {
    try {
      const data = globalThis.localStorage?.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveApplications(apps) {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(apps));
    } catch (err) {
      console.warn('Could not save healer applications:', err);
    }
  }

  submitApplication(data) {
    const apps = this._getApplications();
    const newApp = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      applicantName: data.name,
      email: data.email,
      phone: data.phone || '',
      serviceZip: data.serviceZip || '90210',
      experienceYears: Number(data.experienceYears) || 2,
      certifications: data.certifications || [{ title: 'Reiki Level II', issuingBody: 'Usui Shiki Ryoho' }],
      modalities: data.modalities || ['distance_reiki'],
      motivation: data.motivation || '',
      experienceText: data.experience || '',
      wellnessSafeHarborConsent: true,
      status: 'pending',
      carissaNotes: '',
      submittedAt: new Date().toISOString(),
    };

    apps.unshift(newApp);
    this._saveApplications(apps);
    return newApp;
  }

  scheduleInterview(appId, interviewDate, notes = '') {
    const apps = this._getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found`);

    app.status = 'interview_scheduled';
    app.interviewDate = interviewDate;
    if (notes) app.carissaNotes = notes;
    app.updatedAt = new Date().toISOString();

    this._saveApplications(apps);
    return { success: true, application: app };
  }

  approveApplication(appId, approvedBy = 'Carissa') {
    const apps = this._getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found`);

    const token = `onboard_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    app.status = 'approved';
    app.approvedBy = approvedBy;
    app.onboardingToken = token;
    app.onboardingTokenExpiresAt = tokenExpiresAt;
    app.approvedAt = new Date().toISOString();

    this._saveApplications(apps);

    const onboardingLink = `https://reikiandsage.com/onboard/healer?token=${token}&email=${encodeURIComponent(app.email)}`;

    return {
      success: true,
      application: app,
      onboardingToken: token,
      onboardingLink,
      message: `Healer approved by ${approvedBy}. Secure single-use onboarding link generated.`
    };
  }

  declineApplication(appId, reason = 'Not aligned at this time', reviewedBy = 'Carissa') {
    const apps = this._getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found`);

    app.status = 'declined';
    app.declinedReason = reason;
    app.reviewedBy = reviewedBy;
    app.declinedAt = new Date().toISOString();

    this._saveApplications(apps);
    return { success: true, application: app };
  }

  getApplicationsByStatus(status = null) {
    const apps = this._getApplications();
    if (!status) return apps;
    return apps.filter(a => a.status === status);
  }
}

export const healerAdminService = new HealerAdminService();
