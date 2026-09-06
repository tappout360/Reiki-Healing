/**
 * Live Session Domain Rules & Business Invariants
 * Pure business logic — Zero external dependencies.
 */

export const sessionRules = {
  canAdmitSeeker(sessionStatus, healerPresent) {
    return sessionStatus === 'waiting' && Boolean(healerPresent);
  },

  calculateRemainingSeconds(sessionStartTimestamp, totalDurationSeconds = 3600) {
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTimestamp) / 1000);
    return Math.max(0, totalDurationSeconds - elapsedSeconds);
  }
};
