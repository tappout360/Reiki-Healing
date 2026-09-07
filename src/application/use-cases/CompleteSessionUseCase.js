import { createSessionCompletedEvent } from '../../domain/events/DomainEvents.js';

/**
 * Driving Port / Use Case: CompleteSession
 */
export class CompleteSessionUseCase {
  constructor({ sessionRepository, videoRoomPort }) {
    this.sessionRepo = sessionRepository;
    this.videoRoomPort = videoRoomPort;
  }

  async execute({ sessionId }) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    session.complete();
    await this.sessionRepo.save(session);

    const event = createSessionCompletedEvent(session);
    return { success: true, event };
  }
}
