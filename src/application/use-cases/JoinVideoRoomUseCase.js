import { SessionStatus } from '../../domain/sessions/Session.js';

/**
 * Driving Port (Use Case): JoinVideoRoomUseCase
 * Invariant: Cannot enter live video sanctuary unless session is PAID (or already LIVE).
 */
export class JoinVideoRoomUseCase {
  constructor({ sessionRepository, videoRoomPort }) {
    this.sessionRepository = sessionRepository;
    this.videoRoomPort = videoRoomPort;
  }

  async execute({ sessionId, participantId, isHealer = false }) {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Verify invariant: must be paid before entering live video
    if (session.status === SessionStatus.SCHEDULED) {
      throw new Error('Invariant violated: Cannot join live video sanctuary before payment is completed');
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new Error('Cannot join live video for a cancelled session');
    }

    // If entering for first time, advance status to LIVE
    if (session.status === SessionStatus.PAID) {
      session.startLive();
      await this.sessionRepository.save(session);
    }

    return {
      success: true,
      sessionId: session.id,
      status: session.status,
      participantId,
      canAccessRoom: true,
    };
  }
}
