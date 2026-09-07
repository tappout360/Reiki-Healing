import { ComplianceGuardian } from './domain/ComplianceGuardian.js';
import { AuraSoftHoldManager } from './domain/AuraSoftHoldManager.js';
import { AuraMatchmaker } from './domain/AuraMatchmaker.js';
import { NextBestActionEngine } from './domain/NextBestActionEngine.js';

/**
 * Aura OS: Sanctuary Operating Layer Orchestrator
 * Unified facade integrating Flow, Scheduling, Resonance, Session, and Steward intelligences.
 */
export class AuraOSOrchestrator {
  constructor() {
    this.holdManager = new AuraSoftHoldManager();
  }

  /**
   * Flow Intelligence: Computes the single next best action for the current screen/state
   */
  getNextBestAction(context) {
    return NextBestActionEngine.compute(context);
  }

  /**
   * Scheduling Intelligence: Acquire atomic 10-minute hold
   */
  holdSlot(slotId, healerId, seekerId) {
    return this.holdManager.acquireHold({ slotId, healerId, seekerId });
  }

  /**
   * Scheduling Intelligence: Release soft hold
   */
  releaseHold(slotId, seekerId) {
    return this.holdManager.releaseHold(slotId, seekerId);
  }

  /**
   * Matchmaker Intelligence: Rank and explain slots
   */
  rankHealerSlots({ seeker, healers, availableSlots }) {
    return AuraMatchmaker.rankSlots({ seeker, healers, availableSlots });
  }

  /**
   * Steward Intelligence: Enforces HIPAA & Federal FTC/FDA compliance
   */
  sanitizeText(text) {
    return ComplianceGuardian.evaluate(text);
  }
}

export const auraOS = new AuraOSOrchestrator();
