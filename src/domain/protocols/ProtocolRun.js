/**
 * ProtocolRun Aggregate Root
 * Bounded Context: Protocols & Frequency Alignment
 * 
 * Represents an individual seeker's guided crystal, sound, or breathwork session.
 * Pure spiritual wellness & non-clinical resonance tracking.
 */
export const ProtocolRunStatus = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export class ProtocolRun {
  constructor({
    id,
    protocolId,
    seekerId,
    status = ProtocolRunStatus.ACTIVE,
    startedAt = new Date().toISOString(),
    completedAt = null,
    durationSeconds = 0,
    resonanceGain = 0,
  }) {
    if (!id) throw new Error('ProtocolRun must have an id');
    if (!protocolId) throw new Error('ProtocolRun must have a protocolId');
    if (!seekerId) throw new Error('ProtocolRun must have a seekerId');

    this.id = id;
    this.protocolId = protocolId;
    this.seekerId = seekerId;
    this.status = status;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.durationSeconds = durationSeconds;
    this.resonanceGain = resonanceGain;
  }

  complete({ durationSeconds = 600, resonanceGain = 10 } = {}) {
    if (this.status === ProtocolRunStatus.COMPLETED) {
      throw new Error('Invariant violated: Protocol run is already completed');
    }
    if (this.status === ProtocolRunStatus.CANCELLED) {
      throw new Error('Invariant violated: Cannot complete a cancelled protocol run');
    }

    this.status = ProtocolRunStatus.COMPLETED;
    this.completedAt = new Date().toISOString();
    this.durationSeconds = Math.max(0, Number(durationSeconds) || 0);
    this.resonanceGain = Math.max(0, Number(resonanceGain) || 0);
  }

  cancel() {
    if (this.status === ProtocolRunStatus.COMPLETED) {
      throw new Error('Invariant violated: Cannot cancel an already completed protocol run');
    }
    this.status = ProtocolRunStatus.CANCELLED;
  }
}
