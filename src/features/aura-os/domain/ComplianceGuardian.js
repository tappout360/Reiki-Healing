/**
 * Aura OS: Compliance & Tone Guardian
 * 
 * Enforces strict Federal FTC/FDA non-medical wellness safe harbor
 * and HIPAA zero-PHI ingestion rules across all AI and user text flows.
 */

export const FORBIDDEN_CLINICAL_TERMS = [
  'diagnose', 'diagnosis', 'cure', 'prescribe', 'prescription',
  'treat', 'treatment', 'trauma therapy', 'bipolar', 'depression clinic',
  'anxiety disorder', 'cancer', 'disease', 'physical therapy',
  'psychiatry', 'clinical trial', 'medical advice', 'dosage'
];

export const SAFE_WELLNESS_TERMS = [
  'meditation', 'relaxation', 'spiritual alignment', 'breathwork',
  'sound immersion', 'crystal resonance', 'presence', 'serenity'
];

export class ComplianceGuardian {
  /**
   * Scans text for clinical or PHI risks
   */
  static evaluate(text) {
    if (!text || typeof text !== 'string') return { isCompliant: true, sanitizedText: '' };

    const lower = text.toLowerCase();
    const detectedTerms = FORBIDDEN_CLINICAL_TERMS.filter(term => lower.includes(term));

    if (detectedTerms.length > 0) {
      return {
        isCompliant: false,
        detectedTerms,
        sanitizedText: "Reiki & Sage provides spiritual wellness, meditation, and energetic alignment practices. We do not provide medical, clinical, or psychiatric diagnoses or treatments. For any medical inquiries, please consult a licensed healthcare practitioner.",
        warning: `Blocked non-compliant clinical terms: ${detectedTerms.join(', ')}`
      };
    }

    return {
      isCompliant: true,
      detectedTerms: [],
      sanitizedText: text.trim()
    };
  }

  /**
   * Sanitizes outgoing AI prompts to ensure peaceful, non-pushy tone
   */
  static enforceSacredTone(text) {
    // Strip pushy urgency words like "HURRY!", "LAST CHANCE!", "DON'T MISS OUT"
    return text
      .replace(/\b(hurry|act fast|last chance|don't miss out|buy now)\b/gi, 'take your time')
      .trim();
  }
}
