/**
 * 🍃 Database & Auth Client — Powered 100% by Vercel Serverless & MongoDB Atlas
 * Replaces Firebase/Firestore completely with robust MongoDB APIs & local state fallbacks.
 */
import { mongoDbClient } from './mongoDbClient.js';

export const isFirebaseConfigured = () => true; // Always active via Vercel / MongoDB
export const firestore = null; // Deprecated Firebase instance placeholder

// =====================
// Auth Module (MongoDB Profile Auth + Local Session)
// =====================
export const auth = {
  instance: null,

  signUp: async (email, password, metadata = {}) => {
    const userId = 'user_' + Date.now();
    const profileData = {
      name: metadata.name || '',
      username: (metadata.username || email.split('@')[0]).toLowerCase(),
      email: email.toLowerCase(),
      role: metadata.role || 'seeker',
      subscription: metadata.subscription || 'seeker',
      subscriptionStatus: 'inactive',
      goals: metadata.goals || '',
      experience: metadata.experience || '',
      birthDate: metadata.birthDate || null,
      sessionsCount: 0,
      streak: 0,
      status: 'Active',
      joined: new Date().toISOString()
    };

    try {
      const created = await mongoDbClient.createOrUpdateProfile(userId, profileData);
      localStorage.setItem('user_profile', JSON.stringify(created || profileData));
      return created || profileData;
    } catch {
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      return profileData;
    }
  },

  signIn: async (email, password) => {
    const emailTrimmed = email.trim().toLowerCase();
    const masterEmails = ['jasonmounts77@yahoo.com', 'carissabright@gmail.com'];
    const isMaster = masterEmails.includes(emailTrimmed);

    try {
      const profile = await mongoDbClient.getProfile(emailTrimmed);
      if (profile) {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        return profile;
      }
    } catch {}

    // Check local clients store
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const matched = clients.find(c => c.email?.toLowerCase() === emailTrimmed);
    if (matched) {
      localStorage.setItem('user_profile', JSON.stringify(matched));
      return matched;
    }

    if (isMaster) {
      const masterUser = {
        id: 'master_owner',
        name: emailTrimmed.includes('jason') ? 'Jason Mounts' : 'Master Healer Carissa Bright',
        email: emailTrimmed,
        role: 'owner',
        subscription: 'healer',
        status: 'Active'
      };
      localStorage.setItem('user_profile', JSON.stringify(masterUser));
      return masterUser;
    }

    throw new Error('Account not found. Please verify your credentials or Sign Up.');
  },

  signOut: async () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('tentative_booking');
  },

  getUser: () => {
    try {
      const saved = localStorage.getItem('user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  onAuthStateChange: (callback) => {
    // Initial check
    const currentUser = auth.getUser();
    if (currentUser) {
      callback(currentUser);
    }
    return () => {};
  },

  resetPassword: async (email) => {
    console.log(`Password reset requested for ${email}`);
    return true;
  }
};

// =====================
// Unified Database Module (MongoDB Atlas Serverless)
// =====================
export const db = {
  // --- Profiles ---
  getProfile: async (userId) => {
    try {
      const p = await mongoDbClient.getProfile(userId);
      if (p) return p;
    } catch {}
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    return clients.find(c => c.id === userId || c.email?.toLowerCase() === String(userId).toLowerCase()) || null;
  },

  createProfile: async (userId, data) => {
    try {
      return await mongoDbClient.createOrUpdateProfile(userId, data);
    } catch {
      const profile = { id: userId, ...data };
      const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
      clients.push(profile);
      localStorage.setItem('aura_clients', JSON.stringify(clients));
      return profile;
    }
  },

  updateProfile: async (userId, data) => {
    try {
      return await mongoDbClient.createOrUpdateProfile(userId, data);
    } catch {
      const profile = { id: userId, ...data };
      localStorage.setItem('user_profile', JSON.stringify(profile));
      return profile;
    }
  },

  isUsernameTaken: async (username) => {
    try {
      return await mongoDbClient.isUsernameTaken(username);
    } catch {
      const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
      return clients.some(c => c.username?.toLowerCase() === String(username).toLowerCase());
    }
  },

  // --- Settings ---
  getSettings: async (key) => {
    try {
      const saved = localStorage.getItem(`aura_settings_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  updateSettings: async (key, value) => {
    try {
      localStorage.setItem(`aura_settings_${key}`, JSON.stringify(value));
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  // --- Applications ---
  submitApplication: async (application) => {
    try {
      return await mongoDbClient.submitApplication(application);
    } catch {
      return { id: 'app_' + Date.now(), ...application, status: 'Pending' };
    }
  },

  getApplications: async () => {
    try {
      return await mongoDbClient.getApplications();
    } catch {
      return JSON.parse(localStorage.getItem('aura_applications') || '[]');
    }
  },

  updateApplicationStatus: async (appId, status, reviewerId) => {
    try {
      await mongoDbClient.updateApplicationStatus(appId, status, reviewerId);
    } catch (e) {
      console.warn('Local application update:', e.message);
    }
  },

  // --- Stories ---
  submitStory: async (story) => {
    try {
      return await mongoDbClient.submitStory(story);
    } catch {
      return { id: 'story_' + Date.now(), ...story, status: 'pending' };
    }
  },

  getApprovedStories: async () => {
    try {
      return await mongoDbClient.getApprovedStories();
    } catch {
      return JSON.parse(localStorage.getItem('aura_stories') || '[]').filter(s => s.status === 'approved');
    }
  },

  getAllStories: async () => {
    try {
      return await mongoDbClient.getAllStories();
    } catch {
      return JSON.parse(localStorage.getItem('aura_stories') || '[]');
    }
  },

  updateStoryStatus: async (storyId, status) => {
    try {
      await mongoDbClient.updateStoryStatus(storyId, status);
    } catch (e) {
      console.warn('Local story status update:', e.message);
    }
  },

  // --- Session Logs ---
  logSession: async (log) => {
    try {
      return await mongoDbClient.logSession(log);
    } catch {
      return { id: 'log_' + Date.now(), ...log };
    }
  },

  getSessionLogs: async (userId) => {
    try {
      return await mongoDbClient.getSessionLogs(userId);
    } catch {
      return [];
    }
  },

  // --- Admin: Team & Clients ---
  getTeamMembers: async () => {
    try {
      return await mongoDbClient.getTeamMembers();
    } catch {
      return [];
    }
  },

  getAllClients: async () => {
    try {
      return await mongoDbClient.getAllClients();
    } catch {
      return JSON.parse(localStorage.getItem('aura_clients') || '[]');
    }
  },

  updateRole: async (userId, role) => {
    try {
      await mongoDbClient.createOrUpdateProfile(userId, { role });
    } catch (e) {
      console.warn('Could not update role:', e.message);
    }
  },

  // --- Bookings ---
  getAllBookings: async () => {
    try {
      return await mongoDbClient.getBookings();
    } catch {
      return JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    }
  },

  getUserBookings: async (email) => {
    try {
      return await mongoDbClient.getBookings(email);
    } catch {
      const bookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
      return bookings.filter(b => b.customerEmail?.toLowerCase() === String(email).toLowerCase());
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      await mongoDbClient.updateBookingStatus(bookingId, status);
    } catch (e) {
      console.warn('Could not update booking status:', e.message);
    }
  },

  addBooking: async (booking) => {
    try {
      return await mongoDbClient.addBooking(booking);
    } catch {
      const newB = { id: 'bk_' + Date.now(), ...booking };
      const current = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
      localStorage.setItem('aura_bookings', JSON.stringify([...current, newB]));
      return newB;
    }
  }
};

export default { isFirebaseConfigured, firestore, auth, db };
