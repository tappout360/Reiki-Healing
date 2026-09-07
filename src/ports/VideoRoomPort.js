/**
 * Driven Port: VideoRoomPort
 * Contract for managing video sanctuary rooms.
 */
export class VideoRoomPort {
  async createRoom({ sessionId, healerEmail, seekerEmail }) {
    throw new Error('VideoRoomPort.createRoom must be implemented by adapter');
  }

  async endRoom({ roomUrl }) {
    throw new Error('VideoRoomPort.endRoom must be implemented by adapter');
  }
}
