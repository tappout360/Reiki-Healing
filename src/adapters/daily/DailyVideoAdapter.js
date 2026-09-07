import { VideoRoomPort } from '../../ports/VideoRoomPort.js';
import { dailySessionAdapter } from '../../features/live-sessions/dailySessionAdapter.js';

/**
 * Driven Adapter: DailyVideoAdapter
 * Implements VideoRoomPort.
 */
export class DailyVideoAdapter extends VideoRoomPort {
  async createRoom({ sessionId, healerEmail, seekerEmail }) {
    const res = await fetch('/api/create-daily-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: sessionId,
        customerEmail: seekerEmail,
        healerEmail,
      }),
    });
    return res.json();
  }

  async mountSanctuaryFrame(containerElement, roomUrl, userName) {
    return dailySessionAdapter.initSanctuaryFrame(containerElement, roomUrl, userName);
  }

  destroySanctuaryFrame(callFrame) {
    return dailySessionAdapter.destroySanctuaryFrame(callFrame);
  }
}
