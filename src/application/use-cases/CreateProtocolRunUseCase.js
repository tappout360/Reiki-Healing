import { ProtocolRun } from '../../domain/protocols/ProtocolRun.js';
import { createProtocolRunStartedEvent, createProtocolRunCompletedEvent } from '../../domain/events/DomainEvents.js';

/**
 * Driving Port (Use Case): CreateProtocolRunUseCase
 * Initiates an interactive guided meditation/crystal protocol run for a seeker.
 */
export class CreateProtocolRunUseCase {
  constructor({ protocolRunRepository } = {}) {
    this.repository = protocolRunRepository;
  }

  async execute({ protocolId, seekerId, protocolRunId }) {
    if (!protocolId) throw new Error('protocolId is required');
    if (!seekerId) throw new Error('seekerId is required');

    const run = new ProtocolRun({
      id: protocolRunId || `pr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      protocolId,
      seekerId,
    });

    if (this.repository && this.repository.save) {
      await this.repository.save(run);
    }

    const event = createProtocolRunStartedEvent(run);
    return { success: true, protocolRun: run, event };
  }

  async completeRun({ protocolRun, durationSeconds, resonanceGain }) {
    protocolRun.complete({ durationSeconds, resonanceGain });
    if (this.repository && this.repository.save) {
      await this.repository.save(protocolRun);
    }
    const event = createProtocolRunCompletedEvent(protocolRun);
    return { success: true, protocolRun, event };
  }
}
