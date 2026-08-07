import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { mongoDbClient } from './mongoDbClient.js';

// Firebase config — values come from environment variables
// Set these in Vercel Dashboard → Settings → Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize if config is present
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const authInstance = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;

export const isFirebaseConfigured = () => isConfigured;

// =====================
// Auth helpers
// =====================
export const auth = {
  instance: authInstance,

  signUp: async (email, password, metadata = {}) => {
    if (!authInstance) {
      // Offline / Local state fallback if Firebase Auth is not configured
      const mockUser = {
        uid: 'user_' + Date.now(),
        email,
        displayName: metadata.name || ''
      };
      await db.createProfile(mockUser.uid, {
        name: metadata.name || '',
        username: metadata.username || '',
        email: email.toLowerCase(),
        role: metadata.role || 'seeker',
        subscription: metadata.subscription || 'seeker',
        subscriptionStatus: 'inactive',
        goals: metadata.goals || '',
        experience: metadata.experience || '',
        birthDate: metadata.birthDate || null,
        sessionsCount: 0,
        streak: 0,
        status: 'Active'
      });
      return mockUser;
    }
    const { user } = await createUserWithEmailAndPassword(authInstance, email, password);

    if (metadata.name) {
      await updateProfile(user, { displayName: metadata.name });
    }

    await db.createProfile(user.uid, {
      name: metadata.name || '',
      username: metadata.username || '',
      email: email.toLowerCase(),
      role: metadata.role || 'seeker',
      subscription: metadata.subscription || 'seeker',
      subscriptionStatus: 'inactive',
      goals: metadata.goals || '',
      experience: metadata.experience || '',
      birthDate: metadata.birthDate || null,
      sessionsCount: 0,
      streak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      status: 'Active'
    });

    return user;
  },

  signIn: async (email, password) => {
    if (!authInstance) {
      return { uid: 'demo_user', email };
    }
    const { user } = await signInWithEmailAndPassword(authInstance, email, password);
    return user;
  },

  signOut: async () => {
    if (!authInstance) return;
    await firebaseSignOut(authInstance);
  },

  getUser: () => {
    if (!authInstance) return null;
    return authInstance.currentUser;
  },

  onAuthStateChange: (callback) => {
    if (!authInstance) return () => {};
    return onAuthStateChanged(authInstance, callback);
  },

  resetPassword: async (email) => {
    if (!authInstance) return;
    await sendPasswordResetEmail(authInstance, email);
  }
};

// =====================
// Database helpers (Unified Firestore + MongoDB Adapter)
// =====================
export const db = {
  // --- Profiles ---
  getProfile: async (userId) => {
    if (firestore) {
      const snap = await getDoc(doc(firestore, 'profiles', userId));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    }
    try {
      return await mongoDbClient.getProfile(userId);
    } catch {
      return null;
    }
  },

  createProfile: async (userId, data) => {
    if (firestore) {
      const ref = doc(firestore, 'profiles', userId);
      await setDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const snap = await getDoc(ref);
      return { id: snap.id, ...snap.data() };
    }
    try {
      return await mongoDbClient.createOrUpdateProfile(userId, data);
    } catch {
      return { id: userId, ...data };
    }
  },

  updateProfile: async (userId, data) => {
    if (firestore) {
      const ref = doc(firestore, 'profiles', userId);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      const snap = await getDoc(ref);
      return { id: snap.id, ...snap.data() };
    }
    try {
      return await mongoDbClient.createOrUpdateProfile(userId, data);
    } catch {
      return { id: userId, ...data };
    }
  },

  isUsernameTaken: async (username) => {
    if (firestore) {
      const q = query(
        collection(firestore, 'profiles'),
        where('username', '==', username.toLowerCase()),
        limit(1)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    }
    try {
      return await mongoDbClient.isUsernameTaken(username);
    } catch {
      return false;
    }
  },

  // --- Applications ---
  submitApplication: async (application) => {
    if (firestore) {
      const ref = await addDoc(collection(firestore, 'applications'), {
        ...application,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: ref.id, ...application };
    }
    try {
      return await mongoDbClient.submitApplication(application);
    } catch {
      return { id: 'app_' + Date.now(), ...application, status: 'Pending' };
    }
  },

  getApplications: async () => {
    if (firestore) {
      const q = query(collection(firestore, 'applications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getApplications();
    } catch {
      return [];
    }
  },

  updateApplicationStatus: async (appId, status, reviewerId) => {
    if (firestore) {
      const ref = doc(firestore, 'applications', appId);
      await updateDoc(ref, { status, reviewedBy: reviewerId, updatedAt: serverTimestamp() });
      return;
    }
    try {
      await mongoDbClient.updateApplicationStatus(appId, status, reviewerId);
    } catch (e) {
      console.warn('Could not update application status:', e.message);
    }
  },

  // --- Stories ---
  submitStory: async (story) => {
    if (firestore) {
      const ref = await addDoc(collection(firestore, 'stories'), {
        ...story,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return { id: ref.id, ...story };
    }
    try {
      return await mongoDbClient.submitStory(story);
    } catch {
      return { id: 'story_' + Date.now(), ...story, status: 'pending' };
    }
  },

  getApprovedStories: async () => {
    if (firestore) {
      const q = query(
        collection(firestore, 'stories'),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || (a.timestamp ? new Date(a.timestamp).getTime() / 1000 : 0);
        const timeB = b.createdAt?.seconds || (b.timestamp ? new Date(b.timestamp).getTime() / 1000 : 0);
        return timeB - timeA;
      });
    }
    try {
      return await mongoDbClient.getApprovedStories();
    } catch {
      return [];
    }
  },

  getAllStories: async () => {
    if (firestore) {
      const q = query(collection(firestore, 'stories'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getAllStories();
    } catch {
      return [];
    }
  },

  updateStoryStatus: async (storyId, status) => {
    if (firestore) {
      await updateDoc(doc(firestore, 'stories', storyId), { status });
      return;
    }
    try {
      await mongoDbClient.updateStoryStatus(storyId, status);
    } catch (e) {
      console.warn('Could not update story status:', e.message);
    }
  },

  // --- Session logs ---
  logSession: async (log) => {
    if (firestore) {
      const ref = await addDoc(collection(firestore, 'session_logs'), {
        ...log,
        createdAt: serverTimestamp()
      });
      return { id: ref.id, ...log };
    }
    try {
      return await mongoDbClient.logSession(log);
    } catch {
      return { id: 'log_' + Date.now(), ...log };
    }
  },

  getSessionLogs: async (userId) => {
    if (firestore) {
      const q = query(
        collection(firestore, 'session_logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getSessionLogs(userId);
    } catch {
      return [];
    }
  },

  // --- Admin: Team & Clients ---
  getTeamMembers: async () => {
    if (firestore) {
      const q = query(
        collection(firestore, 'profiles'),
        where('role', 'in', ['healer', 'admin', 'owner', 'staff'])
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getTeamMembers();
    } catch {
      return [];
    }
  },

  getAllClients: async () => {
    if (firestore) {
      const q = query(collection(firestore, 'profiles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getAllClients();
    } catch {
      return [];
    }
  },

  updateRole: async (userId, role) => {
    if (firestore) {
      await updateDoc(doc(firestore, 'profiles', userId), {
        role,
        updatedAt: serverTimestamp()
      });
      return;
    }
    try {
      await mongoDbClient.createOrUpdateProfile(userId, { role });
    } catch (e) {
      console.warn('Could not update role:', e.message);
    }
  },

  // --- Bookings ---
  getAllBookings: async () => {
    if (firestore) {
      const q = query(collection(firestore, 'bookings'), orderBy('bookingDate', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getBookings();
    } catch {
      return [];
    }
  },

  getUserBookings: async (email) => {
    if (firestore) {
      const q = query(
        collection(firestore, 'bookings'),
        where('customerEmail', '==', email.toLowerCase()),
        orderBy('bookingDate', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    try {
      return await mongoDbClient.getBookings(email);
    } catch {
      return [];
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    if (firestore) {
      await updateDoc(doc(firestore, 'bookings', bookingId), { status, updatedAt: serverTimestamp() });
      return;
    }
    try {
      await mongoDbClient.updateBookingStatus(bookingId, status);
    } catch (e) {
      console.warn('Could not update booking status:', e.message);
    }
  },

  addBooking: async (booking) => {
    if (firestore) {
      const ref = await addDoc(collection(firestore, 'bookings'), {
        ...booking,
        createdAt: serverTimestamp()
      });
      return { id: ref.id, ...booking };
    }
    try {
      return await mongoDbClient.addBooking(booking);
    } catch {
      return { id: 'bk_' + Date.now(), ...booking };
    }
  }
};
