/**
 * Aura OS: Matchmaker Intelligence
 * 
 * Computes multi-factor alignment score:
 * Intention fit (35%) + Time fit (25%) + Rating (15%) + Load Balance/Burnout (15%) + Proximity (10%)
 * Generates transparent, human explanations.
 */

export class AuraMatchmaker {
  /**
   * Rank healer slots for a seeker
   */
  static rankSlots({ seeker, healers, availableSlots }) {
    return availableSlots
      .map(slot => {
        const healer = healers.find(h => h.id === slot.healerId) || {
          name: 'Sanctuary Healer',
          ratingAverage: 5.0,
          dailySessionLimit: 4,
          currentDayBookings: 1
        };

        const scoreObj = this.calculateMatchScore({ seeker, healer, slot });
        return {
          ...slot,
          healerName: healer.name,
          matchScore: scoreObj.score,
          breakdown: scoreObj.breakdown,
          explanation: scoreObj.explanation
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  static calculateMatchScore({ seeker, healer, slot }) {
    // 1. Intention alignment (0.0 - 1.0)
    const seekerIntentions = seeker?.intentionTags || ['general_alignment'];
    const healerModalities = healer?.modalities || ['distance_reiki'];
    const hasMatch = seekerIntentions.some(intent => 
      healerModalities.some(mod => mod.toLowerCase().includes(intent.toLowerCase()))
    );
    const sIntent = hasMatch ? 1.0 : 0.7;

    // 2. Time preference alignment (0.0 - 1.0)
    const preferredTime = seeker?.preferredTimeOfDay || 'afternoon'; // 'morning' | 'afternoon' | 'evening'
    const slotHour = slot?.hour24 ?? 14;
    let sTime = 0.5;
    if (preferredTime === 'morning' && slotHour < 12) sTime = 1.0;
    else if (preferredTime === 'afternoon' && slotHour >= 12 && slotHour < 17) sTime = 1.0;
    else if (preferredTime === 'evening' && slotHour >= 17) sTime = 1.0;

    // 3. Rating score (normalized 4.0 - 5.0 -> 0.0 - 1.0)
    const rating = healer?.ratingAverage || 5.0;
    const sRating = Math.min(1.0, Math.max(0.0, (rating - 4.0) / 1.0));

    // 4. Burnout Load Balance (1.0 = rested, 0.0 = at max capacity)
    const limit = healer?.dailySessionLimit || 4;
    const current = healer?.currentDayBookings || 0;
    const sBalance = Math.max(0.0, (limit - current) / limit);

    // 5. Proximity (1.0 for distance sessions)
    const sProx = slot?.serviceType === 'onsite' 
      ? Math.max(0.0, 1.0 - ((slot?.distanceMiles || 10) / 50)) 
      : 1.0;

    // Weighted composite
    const score = Number((
      (0.35 * sIntent) + 
      (0.25 * sTime) + 
      (0.15 * sRating) + 
      (0.15 * sBalance) + 
      (0.10 * sProx)
    ).toFixed(2));

    // Human explanation
    const reasons = [];
    if (hasMatch) reasons.push('matches your intention');
    if (sTime === 1.0) reasons.push(`fits your ${preferredTime} preference`);
    if (sBalance >= 0.75) reasons.push('${healer.name} has optimal energy today');

    const explanation = `Recommended because this slot ${reasons.join(', ')}.`;

    return {
      score,
      breakdown: { sIntent, sTime, sRating, sBalance, sProx },
      explanation
    };
  }
}
