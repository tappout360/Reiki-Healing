/**
 * Driven Port: SessionRepositoryPort
 * Contract for persisting and retrieving Sessions.
 */
export class SessionRepositoryPort {
  async save(session) {
    throw new Error('SessionRepositoryPort.save must be implemented by adapter');
  }

  async findById(sessionId) {
    throw new Error('SessionRepositoryPort.findById must be implemented by adapter');
  }

  async findBySeeker(seekerId) {
    throw new Error('SessionRepositoryPort.findBySeeker must be implemented by adapter');
  }
}
