/**
 * Aura OS: Scheduling Intelligence - Atomic Soft Hold Manager
 * 
 * Enforces a 10-minute atomic hold on session slots during checkout.
 * Protects against double-booking and auto-releases expired holds.
 */

export class AuraSoftHoldManager {
  constructor(storageKey = 'reiki_aura_holds') {
    this.storageKey = storageKey;
    this.HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  }

  _getHolds() {
    try {
      const data = globalThis.localStorage?.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _saveHolds(holds) {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(holds));
    } catch (err) {
      console.warn('Could not persist soft holds:', err);
    }
  }

  /**
   * Attempts to acquire an atomic 10-minute hold on a slot
   */
  acquireHold({ slotId, healerId, seekerId }) {
    const now = Date.now();
    const holds = this._getHolds();
    const existing = holds[slotId];

    // Clean up expired hold
    if (existing && existing.expiresAt <= now) {
      delete holds[slotId];
    }

    // Check if currently held by someone else
    if (holds[slotId] && holds[slotId].seekerId !== seekerId) {
      const remainingSeconds = Math.ceil((holds[slotId].expiresAt - now) / 1000);
      return {
        success: false,
        reason: 'SLOT_HELD',
        remainingSeconds,
        message: 'This sacred slot was just reserved by another seeker. Please select another time or check back shortly.'
      };
    }

    // Grant or refresh hold for current seeker
    const expiresAt = now + this.HOLD_DURATION_MS;
    holds[slotId] = {
      slotId,
      healerId,
      seekerId,
      heldAt: now,
      expiresAt
    };

    this._saveHolds(holds);

    return {
      success: true,
      slotId,
      seekerId,
      expiresAt,
      remainingSeconds: 600,
      formattedExpiresAt: new Date(expiresAt).toLocaleTimeString()
    };
  }

  /**
   * Release hold (e.g. checkout cancelled or abandoned)
   */
  releaseHold(slotId, seekerId) {
    const holds = this._getHolds();
    if (holds[slotId] && (!seekerId || holds[slotId].seekerId === seekerId)) {
      delete holds[slotId];
      this._saveHolds(holds);
      return { success: true };
    }
    return { success: false, reason: 'NOT_FOUND_OR_UNAUTHORIZED' };
  }

  /**
   * Checks if slot is currently available (not held and not expired)
   */
  isSlotHeldByOther(slotId, seekerId) {
    const now = Date.now();
    const holds = this._getHolds();
    const hold = holds[slotId];
    if (!hold) return false;
    if (hold.expiresAt <= now) return false;
    return hold.seekerId !== seekerId;
  }
}
