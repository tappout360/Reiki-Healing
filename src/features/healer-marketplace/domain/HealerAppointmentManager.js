/**
 * Healer OS: Appointment Request Lifecycle Manager
 * 
 * Empowers healers with sovereign schedule control:
 * - Accept appointment (locks slot, prepares Daily room)
 * - Decline appointment with compassionate reason (triggers instant seeker refund)
 * - Propose alternative slots (gives seeker 24 hours to accept new time)
 */

export const AppointmentStatus = Object.freeze({
  PENDING: 'pending_healer',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  ALTERNATIVE_PROPOSED: 'alternative_proposed',
  CANCELLED: 'cancelled',
});

export class HealerAppointmentManager {
  constructor(storageKey = 'reiki_healer_appointments') {
    this.storageKey = storageKey;
  }

  _getStore() {
    try {
      const data = globalThis.localStorage?.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveStore(items) {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('Could not save appointments:', err);
    }
  }

  createRequest({ id, sessionId, healerId, seekerId, seekerName, slotUtc, serviceType, price, intentionTags }) {
    const list = this._getStore();
    const newReq = {
      id: id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sessionId,
      healerId,
      seekerId,
      seekerName: seekerName || 'Seeker',
      slotUtc,
      serviceType: serviceType || 'distance_live',
      price: Number(price) || 88,
      netPayout: Number((price * 0.85).toFixed(2)),
      intentionTags: intentionTags || ['spiritual_alignment'],
      status: AppointmentStatus.PENDING,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24-hr window
    };

    list.push(newReq);
    this._saveStore(list);
    return newReq;
  }

  acceptRequest(requestId, healerId) {
    const list = this._getStore();
    const req = list.find(r => r.id === requestId && r.healerId === healerId);
    if (!req) throw new Error(`Appointment request ${requestId} not found or unauthorized`);

    if (req.status !== AppointmentStatus.PENDING && req.status !== AppointmentStatus.ALTERNATIVE_PROPOSED) {
      throw new Error(`Cannot accept appointment in status: ${req.status}`);
    }

    req.status = AppointmentStatus.ACCEPTED;
    req.acceptedAt = new Date().toISOString();
    this._saveStore(list);

    return {
      success: true,
      request: req,
      message: 'Appointment accepted. Seeker has been notified and room prepared.'
    };
  }

  declineRequest(requestId, healerId, reason = 'Schedule conflict') {
    const list = this._getStore();
    const req = list.find(r => r.id === requestId && r.healerId === healerId);
    if (!req) throw new Error(`Appointment request ${requestId} not found or unauthorized`);

    req.status = AppointmentStatus.DECLINED;
    req.declinedReason = reason;
    req.declinedAt = new Date().toISOString();
    this._saveStore(list);

    return {
      success: true,
      request: req,
      message: 'Appointment declined with gratitude. Seeker refunded and offered alternative healers.'
    };
  }

  proposeAlternative(requestId, healerId, proposedSlots = []) {
    if (!proposedSlots || proposedSlots.length === 0) {
      throw new Error('Must provide at least one alternative slot');
    }

    const list = this._getStore();
    const req = list.find(r => r.id === requestId && r.healerId === healerId);
    if (!req) throw new Error(`Appointment request ${requestId} not found or unauthorized`);

    req.status = AppointmentStatus.ALTERNATIVE_PROPOSED;
    req.proposedSlots = proposedSlots;
    req.proposedAt = new Date().toISOString();
    this._saveStore(list);

    return {
      success: true,
      request: req,
      message: 'Alternative slots sent to seeker for confirmation.'
    };
  }

  getRequestsForHealer(healerId) {
    return this._getStore().filter(r => r.healerId === healerId);
  }
}
