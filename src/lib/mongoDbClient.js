// Client-side API helper for MongoDB serverless endpoints (/api/db/*)
// Enables seamless CRUD operations when deployed on Vercel with MongoDB

async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`API call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const mongoDbClient = {
  // --- Bookings ---
  getBookings: async (email) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetchApi(`/api/db/bookings${query}`);
    return res.bookings || [];
  },

  addBooking: async (bookingData) => {
    const res = await fetchApi('/api/db/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    return res.booking;
  },

  updateBookingStatus: async (id, status, paymentStatus) => {
    const res = await fetchApi('/api/db/bookings', {
      method: 'PUT',
      body: JSON.stringify({ id, status, paymentStatus })
    });
    return res;
  },

  // --- Profiles ---
  getProfile: async (userId) => {
    const res = await fetchApi(`/api/db/profiles?userId=${encodeURIComponent(userId)}`);
    return res.profile || null;
  },

  createOrUpdateProfile: async (userId, data) => {
    const res = await fetchApi('/api/db/profiles', {
      method: 'POST',
      body: JSON.stringify({ userId, ...data })
    });
    return res.profile;
  },

  isUsernameTaken: async (username) => {
    const res = await fetchApi(`/api/db/profiles?username=${encodeURIComponent(username)}`);
    return res.exists || false;
  },

  getTeamMembers: async () => {
    const res = await fetchApi('/api/db/profiles?type=team');
    return res.profiles || [];
  },

  getAllClients: async () => {
    const res = await fetchApi('/api/db/profiles');
    return res.profiles || [];
  },

  // --- Stories ---
  getApprovedStories: async () => {
    const res = await fetchApi('/api/db/stories');
    return res.stories || [];
  },

  getAllStories: async () => {
    const res = await fetchApi('/api/db/stories?all=true');
    return res.stories || [];
  },

  submitStory: async (story) => {
    const res = await fetchApi('/api/db/stories', {
      method: 'POST',
      body: JSON.stringify(story)
    });
    return res.story;
  },

  updateStoryStatus: async (id, status) => {
    const res = await fetchApi('/api/db/stories', {
      method: 'PUT',
      body: JSON.stringify({ id, status })
    });
    return res;
  },

  // --- Applications ---
  submitApplication: async (appData) => {
    const res = await fetchApi('/api/db/applications', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
    return res.application;
  },

  getApplications: async () => {
    const res = await fetchApi('/api/db/applications');
    return res.applications || [];
  },

  updateApplicationStatus: async (id, status, reviewerId) => {
    const res = await fetchApi('/api/db/applications', {
      method: 'PUT',
      body: JSON.stringify({ id, status, reviewerId })
    });
    return res;
  },

  // --- Session Logs ---
  logSession: async (log) => {
    const res = await fetchApi('/api/db/session-logs', {
      method: 'POST',
      body: JSON.stringify(log)
    });
    return res.log;
  },

  getSessionLogs: async (userId) => {
    const res = await fetchApi(`/api/db/session-logs?userId=${encodeURIComponent(userId)}`);
    return res.logs || [];
  }
};
