
// Advanced Horoscope Utility for the Healing Sanctuary
// Provides personalized "vibrational resonance" based on zodiac signs

const zodiacSigns = [
  { name: 'Aries', start: [3, 21], end: [4, 19], element: 'Fire', color: '#ff4b2b', frequency: '528Hz' },
  { name: 'Taurus', start: [4, 20], end: [5, 20], element: 'Earth', color: '#11998e', frequency: '432Hz' },
  { name: 'Gemini', start: [5, 21], end: [6, 20], element: 'Air', color: '#f8ff00', frequency: '582Hz' },
  { name: 'Cancer', start: [6, 21], end: [7, 22], element: 'Water', color: '#00c6ff', frequency: '396Hz' },
  { name: 'Leo', start: [7, 23], end: [8, 22], element: 'Fire', color: '#f2994a', frequency: '639Hz' },
  { name: 'Virgo', start: [8, 23], end: [9, 22], element: 'Earth', color: '#27ae60', frequency: '741Hz' },
  { name: 'Libra', start: [9, 23], end: [10, 22], element: 'Air', color: '#ff9a9e', frequency: '852Hz' },
  { name: 'Scorpio', start: [10, 23], end: [11, 21], element: 'Water', color: '#4b1248', frequency: '285Hz' },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21], element: 'Fire', color: '#8e44ad', frequency: '963Hz' },
  { name: 'Capricorn', start: [12, 22], end: [1, 19], element: 'Earth', color: '#2c3e50', frequency: '174Hz' },
  { name: 'Aquarius', start: [1, 20], end: [2, 18], element: 'Air', color: '#00d2ff', frequency: '417Hz' },
  { name: 'Pisces', start: [2, 19], end: [3, 20], element: 'Water', color: '#a1c4fd', frequency: '528Hz' }
];

export const getZodiacSign = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return zodiacSigns.find(sign => {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    return (month === startMonth && day >= startDay) || (month === endMonth && day <= endDay);
  }) || zodiacSigns[8]; // Fallback to Sag if error
};

export const getAdvancedHoroscope = (signName) => {
  const sign = zodiacSigns.find(s => s.name === signName) || zodiacSigns[0];
  
  const focuses = [
    "Lunar Node Calibration",
    "Mars-Jupiter Resonance",
    "Venus Ascendant Alignment",
    "Saturnian Boundary Strength",
    "Mercurial Cognitive Flow",
    "Solar Core Integration",
    "Neptunian Dream-Stream",
    "Plutonian Metamorphosis"
  ];

  const genericMessages = [
    "Your auric field is expanding today via the 528Hz Miracle Frequency. Focus on crown-chakra expansion for cognitive clarity.",
    "The alignment suggests a grounding session with Smokey Quartz. Your root-chakra frequency is fluctuating—stabilize via breath-work.",
    "Breathe into the heart space; your emotional vibrational signature is reaching a peak. Excellent for collaborative energy work.",
    "Manifestation energy at 80% capacity. Calibrate your intentions with the rising solar cycle. AVOID low-vibrational environments.",
    "A period of deep cellular reflection is commencing. Trust the silence of the void. Your DNA resonance is shifting toward renewal.",
    "Creative spark ignition detected. Flow with the current of inspiration. Your throat chakra is clear; speak your truth into the field.",
    "Subconscious processing is high. Keep a journal of your dream-state data. Neptune is broadcasting on an ethereal frequency.",
    "Radical transformation is nearing. Shed old vibrational skins. You are moving from a state of static to a state of flow."
  ];

  // Randomize based on date and sign to keep it unique per user per day
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const seed = (dayOfYear + signName.length + (signName.charCodeAt(0) || 0));
  const index = seed % focuses.length;

  return {
    ...sign,
    focus: focuses[index],
    message: genericMessages[index],
    intensity: Math.floor((Math.random() * 30) + 70) + "%",
    alignment: focuses[(index + 1) % focuses.length]
  };
};
