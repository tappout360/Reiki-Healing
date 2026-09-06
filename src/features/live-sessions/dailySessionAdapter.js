/**
 * Anti-Corruption Layer for Daily.co WebRTC Video Sanctuary
 * Isolates Daily.co call frame logic from Sanctuary React components.
 */

export const dailySessionAdapter = {
  async initSanctuaryFrame(containerElement, roomUrl, userName = 'Seeker') {
    if (typeof window === 'undefined') return null;
    const DailyIframe = (await import('@daily-co/daily-js')).default;
    
    // Clean existing iframe inside container
    containerElement.innerHTML = '';

    const callFrame = DailyIframe.createFrame(containerElement, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
        backgroundColor: '#0a0a0f',
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    });

    await callFrame.join({
      url: roomUrl,
      userName: userName,
    });

    return callFrame;
  },

  destroySanctuaryFrame(callFrame) {
    if (callFrame) {
      try {
        callFrame.leave();
        callFrame.destroy();
      } catch (err) {
        console.warn('Daily callFrame cleanup notice:', err);
      }
    }
  }
};
