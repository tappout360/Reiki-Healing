/**
 * Aura OS: Next Best Action (NBA) Engine
 * 
 * Evaluates seeker state and outputs exactly ONE primary, high-leverage action
 * to avoid overwhelming the seeker.
 */

export class NextBestActionEngine {
  static compute({ user, upcomingSession, recentProtocolRun }) {
    const now = Date.now();

    // 1. Session Readiness (T - 15 minutes to session start)
    if (upcomingSession && upcomingSession.status === 'paid') {
      const sessionStart = new Date(upcomingSession.slot?.startUtc || upcomingSession.date).getTime();
      const diffMinutes = (sessionStart - now) / (1000 * 60);

      if (diffMinutes <= 15 && diffMinutes >= -60) {
        return {
          type: 'JOIN_WAITING_ROOM',
          priority: 'URGENT',
          title: 'Your Sanctuary is Ready',
          subtitle: `Live resonance session with ${upcomingSession.healerName || 'Carissa'}`,
          actionLabel: 'Enter Waiting Room',
          targetRoute: `/portal/session/${upcomingSession.id}`,
          auraColor: '#9b59b6'
        };
      }

      if (diffMinutes > 15 && diffMinutes <= 120) {
        return {
          type: 'PRE_SESSION_PREP',
          priority: 'HIGH',
          title: 'Upcoming Session in 2 Hours',
          subtitle: 'Recommended: 3-min grounding audio & AV test',
          actionLabel: 'Begin Pre-Session Prep',
          targetRoute: '/portal/prep',
          auraColor: '#d4af37'
        };
      }
    }

    // 2. Post-Session Integration (Session completed in last 24h)
    if (upcomingSession && upcomingSession.status === 'completed') {
      return {
        type: 'INTEGRATION_PRACTICE',
        priority: 'MEDIUM',
        title: 'Integrate Today\'s Session',
        subtitle: 'Ground your field with a 5-minute warm sound bath',
        actionLabel: 'Play Integration Audio',
        targetRoute: '/protocols/rose',
        auraColor: '#e056fd'
      };
    }

    // 3. First-time Visitor (No completed sessions or protocols)
    if (!user || !user.hasCompletedFreeTrial) {
      return {
        type: 'FREE_ALIGNMENT',
        priority: 'STANDARD',
        title: 'Sacred Heart Alignment',
        subtitle: 'Experience 3 minutes of free guided frequency',
        actionLabel: 'Begin Free Alignment',
        targetRoute: '/protocols/rose',
        auraColor: '#00d2d3'
      };
    }

    // 4. Returning Seeker: Daily practice or book
    return {
      type: 'DAILY_ALIGNMENT',
      priority: 'STANDARD',
      title: 'Daily Resonance Check',
      subtitle: 'Tune into today\'s biofield pulse',
      actionLabel: 'Align Energy Now',
      targetRoute: '/sanctuary',
      auraColor: '#f1c40f'
    };
  }
}
