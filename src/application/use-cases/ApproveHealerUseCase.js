import { createHealerApprovedEvent } from '../../domain/events/DomainEvents.js';

/**
 * Driving Port (Use Case): ApproveHealerUseCase
 * Invariant: Only authorized administrators (Carissa / Jason) can approve healer practitioners.
 */
export class ApproveHealerUseCase {
  constructor({ healerRepository } = {}) {
    this.healerRepository = healerRepository;
  }

  async execute({ healerId, approvedBy }) {
    if (!healerId) throw new Error('healerId is required');
    if (!approvedBy) throw new Error('approvedBy administrator identity is required');

    if (this.healerRepository && this.healerRepository.updateApproval) {
      await this.healerRepository.updateApproval(healerId, true);
    }

    const event = createHealerApprovedEvent(healerId, approvedBy);

    return {
      success: true,
      healerId,
      approvedBy,
      event,
    };
  }
}
