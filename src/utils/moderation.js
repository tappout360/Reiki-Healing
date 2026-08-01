// Content Moderation Filter to prevent discrimination, hate speech, and sexual content
// Aligned with Federal and HIPAA compliance guidelines to maintain a safe, supportive sanctuary environment.

const BLOCKED_TERMS = [
  // Sexual / Explicit Content
  'porn', 'pornography', 'sex', 'sexual', 'erotic', 'naked', 'nudity', 'nude', 'xxx', 
  'dick', 'vagina', 'penis', 'clitoris', 'boobs', 'breast', 'breasts', 'orgasm', 'intercourse', 
  'fuck', 'fucking', 'shit', 'lust', 'arousal', 'aroused', 'coitus', 'ejaculation', 'prostitute', 
  'prostitution', 'rape', 'incest', 'sodomy', 'masturbate', 'masturbation',
  // Discrimination / Hate Speech / Slurs
  'nigger', 'nigga', 'chink', 'kike', 'spic', 'faggot', 'dyke', 'tranny', 'retard', 'retarded',
  'subhuman', 'inferior race', 'white supremacy', 'nazi', 'hitler', 'supremacist', 
  'xenophobia', 'xenophobic', 'racist', 'racism', 'homophobia', 'homophobic', 'transphobia', 
  'transphobic', 'hate speech', 'anti-semitic', 'antisemitism', 'islamophobia', 'islamophobic'
];

/**
 * Checks if the text content contains any discriminatory or sexually explicit terms.
 * @param {string} text - The input text to moderate.
 * @returns {Object} - Result containing safety status and the flagged word if unsafe.
 */
export const moderateContent = (text) => {
  if (!text) return { isSafe: true, flaggedWord: null };
  
  const normalizedText = text.toLowerCase();
  
  for (const term of BLOCKED_TERMS) {
    // For common short words, check with word boundaries to avoid false positives (e.g., "assessment" or "therapy")
    const needsWordBoundary = ['sex', 'nude', 'lust', 'rape', 'shit', 'dyke'].includes(term);
    const pattern = needsWordBoundary 
      ? new RegExp(`\\b${term}\\b`, 'i') 
      : new RegExp(term, 'i');
    
    if (pattern.test(normalizedText)) {
      return { isSafe: false, flaggedWord: term };
    }
  }
  
  return { isSafe: true, flaggedWord: null };
};
