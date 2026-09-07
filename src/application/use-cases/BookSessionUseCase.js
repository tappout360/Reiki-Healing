import { Session, SessionStatus } from '../../domain/sessions/Session.js';

/**
 * Driving Port / Use Case: BookSession
 */
export class BookSessionUseCase {
  constructor({ sessionRepository, paymentPort }) {
    this.sessionRepo = sessionRepository;
    this.paymentPort = paymentPort;
  }

  async execute({ healerId, seekerId, serviceType, price, date, timeSlot }) {
    const sessionId = 'ses_' + Date.now().toString(36);
    const session = new Session({
      id: sessionId,
      healerId,
      seekerId,
      serviceType,
      price,
      status: SessionStatus.SCHEDULED,
      date,
      timeSlot,
    });

    await this.sessionRepo.save(session);
    return { success: true, session };
  }
}
