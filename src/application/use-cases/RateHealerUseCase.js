import { createHealerRatedEvent } from '../../domain/events/DomainEvents.js';

/**
 * Driving Port (Use Case): RateHealerUseCase
 * Invariant: Rating (1-5) can ONLY be submitted after a session is marked COMPLETED.
 */
export class RateHealerUseCase {
  constructor({ sessionRepository }) {
    this.sessionRepository = sessionRepository;
  }

  async execute({ sessionId, rating, seekerId }) {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (seekerId && session.seekerId !== seekerId) {
      throw new Error('Unauthorized: Only the seeker of this session can submit a rating');
    }

    // Pure domain invariant check (must be COMPLETED, 1-5 integer)
    session.rate(rating);

    await this.sessionRepository.save(session);
    const event = createHealerRatedEvent(session.id, session.healerId, session.rating);

    return {
      success: true,
      sessionId: session.id,
      rating: session.rating,
      event,
    };
  }
}
