/**
 * Reiki & Sage — Comprehensive Mock Data Seeder
 * Populates high-fidelity, production-grade test data for:
 *  1. Staff Healer Dashboard (Healer OS)
 *  2. Master Owner & Co-Founder Console (Carissa Review & Revenue Hub)
 *  3. Seeker Sanctuary Experience
 * 
 * Strict Compliance:
 *  - Non-PHI / HIPAA compliant wellness notes (no medical diagnostic language)
 *  - 1099 Independent Contractor classification
 *  - 100% Tips to Healer ($0 platform rake)
 *  - 15% Platform Commission on session fees
 */

export const TEST_CREDENTIALS = {
  masterOwner: {
    name: 'Jason Mounts',
    email: 'jasonmounts77@yahoo.com',
    password: 'Lola2026MyBusiness$$',
    role: 'owner',
    title: 'Master Owner & Technical Founder',
    dashboard: 'Master Owner Console (HealerDashboard)'
  },
  masterHealer: {
    name: 'Carissa Bright',
    email: 'carissabright@gmail.com',
    password: 'Lola2026MyBusiness$$',
    role: 'owner',
    title: 'Master Healer & Co-Founder',
    dashboard: 'Master Owner & Healer Review Console'
  },
  staffHealer: {
    name: 'Elena Rostova, RMT',
    email: 'healer.elena@reikiandsage.com',
    password: 'Lola2026MyBusiness$$',
    role: 'healer',
    title: 'Certified Usui Reiki Master',
    dashboard: 'Staff Healer OS (StaffHealerDashboard)'
  },
  verifiedSeeker: {
    name: 'Sarah Mitchell',
    email: 'sarah.seeker@reikiandsage.com',
    password: 'seeker123',
    role: 'seeker',
    title: 'Verified Sanctuary Seeker',
    dashboard: 'Seeker Sanctuary Dashboard'
  }
};

export const MOCK_BOOKINGS = [
  {
    id: 'bk_live_901',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah.seeker@reikiandsage.com',
    serviceType: 'live',
    bookingDate: new Date().toISOString().split('T')[0], // Today
    bookingTime: '02:00 PM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 20.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    meetingCode: '#772914',
    dailyRoomUrl: 'https://reikiandsage.daily.co/sacred-sanctuary-room-alpha',
    notes: 'Heart chakra opening and emotional cord release following major career transition.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'bk_live_902',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@example.com',
    serviceType: 'live',
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    bookingTime: '10:30 AM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 15.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    meetingCode: '#884102',
    dailyRoomUrl: 'https://reikiandsage.daily.co/sacred-sanctuary-room-alpha',
    notes: 'Deep nervous system reset, releasing neck and shoulder tension via 528Hz sound immersion.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'bk_onsite_903',
    customerName: 'Chloe Bennet',
    customerEmail: 'chloe.b@example.com',
    serviceType: 'onsite',
    bookingDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days out
    bookingTime: '04:00 PM',
    price: 150,
    amount: 150,
    depositAmount: 50,
    tipAmount: 30.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    meetingCode: '#519403',
    notes: 'In-person sanctuary table session: Crystal grids with amethyst and rose quartz heart alignment.',
    healerId: 'carissa_bright',
    healerName: 'Carissa Bright',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'bk_live_904',
    customerName: 'David Thorne',
    customerEmail: 'david.t@example.com',
    serviceType: 'live',
    bookingDate: '2026-09-24',
    bookingTime: '11:00 AM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 25.00,
    rating: 5,
    status: 'completed',
    paymentStatus: 'paid',
    meetingCode: '#391054',
    notes: 'Grounding session before cross-country relocation. Strong energetic peace reported.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: '2026-09-20T14:00:00Z'
  },
  {
    id: 'bk_live_905',
    customerName: 'Maya Lin',
    customerEmail: 'maya.l@example.com',
    serviceType: 'live',
    bookingDate: '2026-09-22',
    bookingTime: '01:00 PM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 20.00,
    rating: 5,
    status: 'completed',
    paymentStatus: 'paid',
    meetingCode: '#442819',
    notes: 'Throat chakra alignment and authentic vocal expression activation.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: '2026-09-18T09:30:00Z'
  },
  {
    id: 'bk_onsite_906',
    customerName: 'Julian Vance',
    customerEmail: 'julian.v@example.com',
    serviceType: 'onsite',
    bookingDate: '2026-09-21',
    bookingTime: '03:30 PM',
    price: 150,
    amount: 150,
    depositAmount: 50,
    tipAmount: 35.00,
    rating: 5,
    status: 'completed',
    paymentStatus: 'paid',
    meetingCode: '#901284',
    notes: 'Sanctuary sound bath & Tibetan singing bowl integration.',
    healerId: 'carissa_bright',
    healerName: 'Carissa Bright',
    createdAt: '2026-09-15T16:00:00Z'
  },
  {
    id: 'bk_live_907',
    customerName: 'Aria Montgomery',
    customerEmail: 'aria.m@example.com',
    serviceType: 'live',
    bookingDate: '2026-09-19',
    bookingTime: '05:00 PM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 20.00,
    rating: 5,
    status: 'completed',
    paymentStatus: 'paid',
    meetingCode: '#118492',
    notes: 'Solar plexus confidence clearing and aura soothing.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: '2026-09-14T11:00:00Z'
  },
  {
    id: 'bk_live_908',
    customerName: 'Liam Kendrick',
    customerEmail: 'liam.k@example.com',
    serviceType: 'live',
    bookingDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    bookingTime: '09:00 AM',
    price: 88,
    amount: 88,
    depositAmount: 88,
    tipAmount: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    meetingCode: '#663920',
    notes: 'Mindfulness meditation & breath synchronization.',
    healerId: 'healer_elena_01',
    healerName: 'Elena Rostova',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CLIENTS = [
  {
    id: 'usr_owner_jason',
    name: 'Jason Mounts',
    username: 'jasonmounts',
    email: 'jasonmounts77@yahoo.com',
    role: 'owner',
    subscription: 'healing',
    status: 'Active',
    phone: '(206) 555-0100',
    experience: 'Master Founder & Technical Operator',
    lastSessionDate: '2026-09-27',
    sessionsCount: 24,
    streak: 60,
    approvalStatus: 'Approved'
  },
  {
    id: 'usr_owner_carissa',
    name: 'Carissa Bright',
    username: 'carissabright',
    email: 'carissabright@gmail.com',
    role: 'owner',
    subscription: 'healing',
    status: 'Active',
    phone: '(206) 555-0101',
    experience: 'Founder & Certified Usui Reiki Master Teacher',
    lastSessionDate: '2026-09-27',
    sessionsCount: 38,
    streak: 90,
    approvalStatus: 'Approved'
  },
  {
    id: 'usr_healer_elena',
    name: 'Elena Rostova, RMT',
    username: 'healer.elena',
    email: 'healer.elena@reikiandsage.com',
    role: 'healer',
    subscription: 'healing',
    status: 'Active',
    phone: '(206) 555-0102',
    experience: '8 Years Certified Usui Reiki & Sound Frequency',
    lastSessionDate: '2026-09-26',
    sessionsCount: 16,
    streak: 30,
    approvalStatus: 'Approved'
  },
  {
    id: 'usr_seeker_sarah',
    name: 'Sarah Mitchell',
    username: 'sarahmitchell',
    email: 'sarah.seeker@reikiandsage.com',
    role: 'seeker',
    subscription: 'seeker',
    status: 'Active',
    phone: '(206) 555-0103',
    experience: 'Seeker — Exploring Daily Meditations',
    lastSessionDate: '2026-09-24',
    sessionsCount: 5,
    streak: 14,
    approvalStatus: 'Approved'
  },
  {
    id: 'usr_seeker_marcus',
    name: 'Marcus Vance',
    username: 'marcusvance',
    email: 'marcus.v@example.com',
    role: 'seeker',
    subscription: 'seeker',
    status: 'Active',
    phone: '(206) 555-0104',
    experience: 'Seeker — Stress Reduction & Breathwork',
    lastSessionDate: '2026-09-20',
    sessionsCount: 3,
    streak: 8,
    approvalStatus: 'Approved'
  },
  {
    id: 'usr_seeker_chloe',
    name: 'Chloe Bennet',
    username: 'chloebennet',
    email: 'chloe.b@example.com',
    role: 'seeker',
    subscription: 'healing',
    status: 'Active',
    phone: '(206) 555-0105',
    experience: 'Seeker — In-Person Crystal & Reiki Journeys',
    lastSessionDate: '2026-09-25',
    sessionsCount: 7,
    streak: 21,
    approvalStatus: 'Approved'
  }
];

export const MOCK_APPLICATIONS = [
  {
    id: 'app_101',
    fullName: 'Elena Rostova, RMT',
    email: 'healer.elena@reikiandsage.com',
    phone: '(206) 555-4321',
    location: 'Seattle, WA',
    modalities: ['Usui Reiki Master (Level III)', 'Tibetan Sound Frequency', 'Somatic Breath Regulation'],
    yearsExperience: 8,
    licenseInfo: 'WA State Certified Reiki Master #RMT-88412',
    bio: 'Dedicated to cultivating tranquil presence, nervous system decompression, and subtle energy harmonization. Trained in direct Usui lineage.',
    status: 'Approved',
    submittedAt: '2026-09-10T14:22:00Z',
    reviewedBy: 'Carissa Bright',
    decisionDate: '2026-09-12T10:00:00Z',
    interviewNotes: 'Exquisite grounded presence. Authentic lineage verified. Perfect fit for boutique sanctuary values.'
  },
  {
    id: 'app_102',
    fullName: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '(206) 555-9012',
    location: 'Portland, OR',
    modalities: ['Biofield Tuning', 'Vocal Toning', 'Restorative Mindfulness'],
    yearsExperience: 5,
    licenseInfo: 'Certified Sound Healing Practitioner #SHP-2021',
    bio: 'Passionate about frequency-based relaxation and guided deep stillness protocols.',
    status: 'InterviewScheduled',
    submittedAt: '2026-09-20T18:40:00Z',
    interviewDate: '2026-10-02',
    interviewTime: '02:00 PM',
    interviewer: 'Carissa Bright',
    interviewFormat: 'Live Video Sanctuary'
  },
  {
    id: 'app_103',
    fullName: 'Chloe Bennet',
    email: 'chloe.b@example.com',
    phone: '(206) 555-8833',
    location: 'Bellevue, WA',
    modalities: ['Crystal Energy Balancing', 'Guided Visual Meditation', 'Aura Cleansing'],
    yearsExperience: 6,
    licenseInfo: 'Certified Energy Practitioner (CEP)',
    bio: 'Focusing on heart-centered grounding and restorative rest for empathic professionals.',
    status: 'Approved',
    submittedAt: '2026-09-14T11:15:00Z',
    reviewedBy: 'Carissa Bright',
    decisionDate: '2026-09-16T15:30:00Z'
  },
  {
    id: 'app_104',
    fullName: 'Julian Thorne',
    email: 'julian.t@example.com',
    phone: '(425) 555-7766',
    location: 'Tacoma, WA',
    modalities: ['Pranic Energy Healing', 'Chakra Balancing'],
    yearsExperience: 3,
    licenseInfo: 'Associate Pranic Healer',
    bio: 'Interested in providing remote live video alignment for evening meditation seekers.',
    status: 'Pending',
    submittedAt: '2026-09-26T20:10:00Z'
  }
];

export const MOCK_TEAM = [
  {
    name: 'Carissa Bright',
    email: 'carissabright@gmail.com',
    status: 'Active',
    role: 'Master Healer & Co-Founder',
    joined: '2026-01-01',
    stripeConnected: true
  },
  {
    name: 'Elena Rostova, RMT',
    email: 'healer.elena@reikiandsage.com',
    status: 'Active',
    role: 'Certified Usui Reiki Master',
    joined: '2026-09-12',
    stripeConnected: true
  },
  {
    name: 'Chloe Bennet',
    email: 'chloe.b@example.com',
    status: 'Active',
    role: 'Certified Crystal Practitioner',
    joined: '2026-09-16',
    stripeConnected: true
  }
];

export const MOCK_STORIES = [
  {
    id: 'story_1',
    title: 'Felt the heaviness lift from my chest',
    author: 'Sarah M.',
    location: 'Seattle, WA',
    content: 'The 5-minute Grounding session during my lunch break felt like two hours of restorative sleep. My shoulders dropped, and my breathing deepened instantly.',
    status: 'approved',
    createdAt: '2026-09-22',
    likes: 42
  },
  {
    id: 'story_2',
    title: 'A true sacred container through screen',
    author: 'David T.',
    location: 'Portland, OR',
    content: 'I was skeptical about remote Reiki over video, but Elena guided me with such quiet mastery. By minute twenty, warmth was radiating through my hands and solar plexus.',
    status: 'approved',
    createdAt: '2026-09-23',
    likes: 38
  },
  {
    id: 'story_3',
    title: 'Peaceful ritual in my chaotic week',
    author: 'Maya L.',
    location: 'Bellevue, WA',
    content: 'The 528Hz heart alignment tone is now my sacred transition ritual before bed. Reiki & Sage feels like an oasis of calm on the internet.',
    status: 'approved',
    createdAt: '2026-09-24',
    likes: 29
  },
  {
    id: 'story_4',
    title: 'Heartwarming practitioner connection',
    author: 'Liam K.',
    location: 'Vancouver, BC',
    content: 'Carissa’s gentle presence helped me release months of pent-up workplace grief. The zero-rush waiting room set the tone perfectly.',
    status: 'approved',
    createdAt: '2026-09-25',
    likes: 31
  },
  {
    id: 'story_5',
    title: 'Grounded and clear-headed',
    author: 'Aria M.',
    location: 'San Francisco, CA',
    content: 'Subscribed to the sanctuary after my first live session. The lack of clinical or gamified noise makes this space genuinely healing.',
    status: 'approved',
    createdAt: '2026-09-26',
    likes: 27
  },
  {
    id: 'story_6',
    title: 'Reverent atmosphere from start to finish',
    author: 'Julian V.',
    location: 'Olympia, WA',
    content: 'A wonderful experience. Looking forward to booking weekly alignments as part of my ongoing wellness journey.',
    status: 'pending', // Pending so Carissa can test approving/archiving in HealerDashboard
    createdAt: '2026-09-27',
    likes: 12
  }
];

export const MOCK_HEALER_PAYOUTS = [
  {
    payoutId: 'po_stripe_88192',
    healerEmail: 'healer.elena@reikiandsage.com',
    requestedAt: '2026-09-25T16:00:00Z',
    requestedAmount: 540.00,
    platformFeePercent: 15,
    netPayoutAmount: 459.00,
    tipsAmount: 85.00,
    totalDispatched: 544.00,
    status: 'paid',
    stripeTransferId: 'tr_1NwReikiExpress88219'
  },
  {
    payoutId: 'po_stripe_88145',
    healerEmail: 'healer.elena@reikiandsage.com',
    requestedAt: '2026-09-18T14:30:00Z',
    requestedAmount: 700.00,
    platformFeePercent: 15,
    netPayoutAmount: 595.00,
    tipsAmount: 110.00,
    totalDispatched: 705.00,
    status: 'paid',
    stripeTransferId: 'tr_1NvReikiExpress77194'
  },
  {
    payoutId: 'po_stripe_88090',
    healerEmail: 'healer.elena@reikiandsage.com',
    requestedAt: '2026-09-11T12:00:00Z',
    requestedAmount: 330.00,
    platformFeePercent: 15,
    netPayoutAmount: 280.50,
    tipsAmount: 40.00,
    totalDispatched: 320.50,
    status: 'paid',
    stripeTransferId: 'tr_1NuReikiExpress66103'
  }
];

export const MOCK_SIGNED_AGREEMENTS = {
  'healer.elena@reikiandsage.com': {
    masterContractorAgreement: {
      signed: true,
      title: 'Independent Practitioner Master Services Agreement',
      signedAt: '2026-09-12T11:00:00Z',
      signeeName: 'Elena Rostova, RMT',
      version: '2026.1',
      classification: '1099 Independent Contractor',
      platformCommission: '15% session fee only',
      tipsPolicy: '100% Healer ($0 platform rake)'
    },
    w9Form: {
      signed: true,
      title: 'IRS Form W-9 Verification',
      signedAt: '2026-09-12T11:05:00Z',
      taxIdMasked: 'XXX-XX-4912',
      businessStructure: 'Sole Proprietorship'
    },
    sacredCodeOfEthics: {
      signed: true,
      title: 'Reiki & Sage Sacred Practitioner Code of Ethics',
      signedAt: '2026-09-12T11:10:00Z'
    },
    wellnessSafeHarborAddendum: {
      signed: true,
      title: 'FTC/FDA Wellness Safe Harbor & Non-PHI Compliance Addendum',
      signedAt: '2026-09-12T11:12:00Z',
      statement: 'Strictly non-clinical relaxation and subtle spiritual energy support. No medical diagnostic or therapeutic claims.'
    }
  }
};

/**
 * Seeds all mock data collections into localStorage for end-to-end testing.
 * @param {Object} options
 * @param {boolean} options.force - If true, overwrites existing keys even if already seeded.
 */
export function seedMockData({ force = false } = {}) {
  try {
    const isAlreadySeeded = localStorage.getItem('aura_mock_data_seeded') === 'true';
    if (isAlreadySeeded && !force) {
      return { seeded: false, message: 'Mock data already seeded in localStorage.' };
    }

    // 1. Bookings
    localStorage.setItem('aura_bookings', JSON.stringify(MOCK_BOOKINGS));

    // 2. Clients / Seekers & Test Accounts
    const existingClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const mergedClientsMap = new Map();
    // Seed test accounts first
    MOCK_CLIENTS.forEach(c => mergedClientsMap.set(c.email.toLowerCase(), c));
    // Keep existing custom clients if not conflicting
    existingClients.forEach(c => {
      if (c.email && !mergedClientsMap.has(c.email.toLowerCase())) {
        mergedClientsMap.set(c.email.toLowerCase(), c);
      }
    });
    localStorage.setItem('aura_clients', JSON.stringify(Array.from(mergedClientsMap.values())));

    // 3. Applications
    localStorage.setItem('aura_applications', JSON.stringify(MOCK_APPLICATIONS));

    // 4. Team Members
    localStorage.setItem('aura_team', JSON.stringify(MOCK_TEAM));

    // 5. Community Stories & Reflections
    localStorage.setItem('aura_stories', JSON.stringify(MOCK_STORIES));

    // 6. Healer Payouts
    localStorage.setItem('aura_healer_payouts', JSON.stringify(MOCK_HEALER_PAYOUTS));

    // 7. Signed Contractor Agreements
    localStorage.setItem('reiki_signed_agreements', JSON.stringify(MOCK_SIGNED_AGREEMENTS));

    // 8. Platform Toggles & Checklist
    localStorage.setItem('aura_applications_enabled', 'true');
    localStorage.setItem('aura_video_price', '88');
    localStorage.setItem('aura_onsite_price', '150');

    // Marker
    localStorage.setItem('aura_mock_data_seeded', 'true');

    // Dispatch storage event so live reactive components update instantly
    window.dispatchEvent(new Event('storage'));

    return {
      seeded: true,
      message: 'Sacred Sanctuary Mock Data successfully seeded.',
      counts: {
        bookings: MOCK_BOOKINGS.length,
        clients: mergedClientsMap.size,
        applications: MOCK_APPLICATIONS.length,
        stories: MOCK_STORIES.length,
        payouts: MOCK_HEALER_PAYOUTS.length
      }
    };
  } catch (err) {
    console.error('Failed to seed mock data:', err);
    return { seeded: false, error: err.message };
  }
}

/**
 * Clears all mock data keys from localStorage.
 */
export function clearMockData() {
  const keysToRemove = [
    'aura_bookings',
    'aura_clients',
    'aura_applications',
    'aura_team',
    'aura_stories',
    'aura_healer_payouts',
    'reiki_signed_agreements',
    'aura_mock_data_seeded'
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
  window.dispatchEvent(new Event('storage'));
  return { cleared: true };
}
