// Sandbox Seeder Utility for Reiki & Sage
// Used to populate localStorage with realistic test data for evaluators

export const OWNER_PROFILE = {
  name: "Carissa (Healer)",
  username: "carissa",
  email: "carissa@reikiandsage.com",
  role: "owner",
  subscription: "healing",
  subscriptionStatus: "active",
  status: "Active",
  streak: 15,
  longestStreak: 25,
  sessionsCount: 32,
  createdAt: "2026-01-01T00:00:00.000Z"
};

export const SEEKER_PROFILE = {
  name: "Aria Winters",
  username: "aria",
  email: "aria@example.com",
  role: "seeker",
  subscription: "healing", // Unlocked for evaluation purposes
  subscriptionStatus: "active",
  status: "Active",
  streak: 5,
  longestStreak: 12,
  sessionsCount: 3,
  birthDate: "1995-04-12",
  createdAt: "2026-05-01T00:00:00.000Z"
};

export const seedSandboxData = () => {
  // 1. Seed bookings
  const mockBookings = [
    {
      id: "booking_101",
      customerName: "Aria Winters",
      customerEmail: "aria@example.com",
      bookingDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
      timeSlot: "11:00 AM",
      sessionType: "live",
      status: "confirmed",
      price: 88,
      selectedProtocol: "Amethyst (Deep Peace)",
      notes: "Seeking stress relief and cosmic realignment."
    },
    {
      id: "booking_102",
      customerName: "Liam Sterling",
      customerEmail: "liam@example.com",
      bookingDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
      timeSlot: "2:00 PM",
      sessionType: "visit",
      status: "completed",
      price: 150,
      selectedProtocol: "Rose Quartz (Heart Glow)",
      notes: "Routine alignment session."
    },
    {
      id: "booking_103",
      customerName: "Selene Moon",
      customerEmail: "selene@example.com",
      bookingDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
      timeSlot: "10:00 AM",
      sessionType: "live",
      status: "pending",
      price: 88,
      selectedProtocol: "Sage (Spiritual Purge)",
      notes: "Moving house - cleansing lingering static."
    },
    {
      id: "booking_104",
      customerName: "Diana Vance",
      customerEmail: "diana@example.com",
      bookingDate: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0], // 8 days ago
      timeSlot: "04:00 PM",
      sessionType: "visit",
      status: "completed",
      price: 150,
      selectedProtocol: "Lapis Lazuli (Aether Link)",
      notes: "Deep pineal gland alignment."
    }
  ];
  localStorage.setItem('aura_bookings', JSON.stringify(mockBookings));

  // 2. Seed clients
  const mockClients = [
    {
      name: "Aria Winters",
      email: "aria@example.com",
      phone: "555-019-2831",
      experience: "Intermediate, sensitive to Amethyst crystal vibrations",
      subscription: "healing",
      status: "Active",
      streak: 5,
      sessionsCount: 3,
      lastSessionDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      createdAt: "2026-05-01T00:00:00.000Z"
    },
    {
      name: "Liam Sterling",
      email: "liam@example.com",
      phone: "555-014-9281",
      experience: "Experienced reiki explorer",
      subscription: "healing",
      status: "Active",
      streak: 12,
      sessionsCount: 8,
      lastSessionDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      createdAt: "2026-03-10T00:00:00.000Z"
    },
    {
      name: "Selene Moon",
      email: "selene@example.com",
      phone: "555-017-4829",
      experience: "First-timer seeking chakra alignment",
      subscription: "seeker",
      status: "Active",
      streak: 1,
      sessionsCount: 1,
      lastSessionDate: null,
      createdAt: "2026-05-28T00:00:00.000Z"
    }
  ];
  localStorage.setItem('aura_clients', JSON.stringify(mockClients));

  // 3. Seed healer applications
  const mockApps = [
    {
      id: "app_101",
      name: "Dimitri Rose",
      email: "dimitri@example.com",
      phone: "+1 555-829-1928",
      specialty: "Sound Baths & Reiki Mastery",
      experience: "8 years practicing in Sedona, Arizona.",
      statement: "I want to join the digital Sanctuary to expand collective consciousness.",
      status: "Pending",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "app_102",
      name: "Elara Sky",
      email: "elara@example.com",
      phone: "+1 555-920-1282",
      specialty: "Crystal grid synchronization",
      experience: "15 years of chakra alignment work.",
      statement: "Pulsing the earth grids online is the next stage of healing.",
      status: "Approved",
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ];
  localStorage.setItem('aura_applications', JSON.stringify(mockApps));

  // 4. Seed Collective Reverie stories
  const mockStories = [
    {
      id: "story_101",
      userName: "Michael Chen",
      story: "The Rose Quartz session completely released a blockage in my chest. Carissa holds an incredibly pure energetic field.",
      rating: 5,
      status: "approved",
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString()
    },
    {
      id: "story_102",
      userName: "Sophia Loren",
      story: "I was skeptical about live-streamed reiki, but the visual alignment dashboard combined with the breathwork felt incredibly warm and soothing.",
      rating: 5,
      status: "approved",
      timestamp: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    {
      id: "story_103",
      userName: "Diana Vance",
      story: "Absolutely amazing. I felt an immediate drop in anxiety and the sound frequencies were perfectly integrated.",
      rating: 4,
      status: "pending",
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];
  localStorage.setItem('aura_stories', JSON.stringify(mockStories));

  // 5. Seed team
  const mockTeam = [
    { name: "Carissa (Healer)", email: "carissa@reikiandsage.com", status: "Active", role: "owner", joined: "2026-01-01" },
    { name: "Elara Sky", email: "elara@example.com", status: "Active", role: "healer", joined: "2026-05-15" }
  ];
  localStorage.setItem('aura_team', JSON.stringify(mockTeam));

  // 6. Seed logs
  const mockLogs = [
    { id: "log_101", date: new Date(Date.now() - 86400000).toISOString().split('T')[0], protocol: "Amethyst (Deep Peace)", duration: 15, rating: 5, notes: "Quiet, calm, centered." },
    { id: "log_102", date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], protocol: "Rose Quartz (Heart Glow)", duration: 20, rating: 4, notes: "Felt warm energy around chest." }
  ];
  localStorage.setItem('vibrational_logs', JSON.stringify(mockLogs));

  // 7. Seed streak data
  const mockStreak = { streak: 5, lastDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], longestStreak: 12 };
  localStorage.setItem('healing_streak', JSON.stringify(mockStreak));

  // 8. Seed prices
  localStorage.setItem('aura_onsite_price', '150');
  localStorage.setItem('aura_video_price', '88');
  localStorage.setItem('aura_pricing', JSON.stringify({
    '1_month': 22,
    '3_month': 55,
    '6_month': 99,
    '1_year': 188
  }));
};
