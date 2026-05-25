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
const firestore = app ? getFirestore(app) : null;

export const isFirebaseConfigured = () => isConfigured;

// =====================
// Auth helpers
// =====================
export const auth = {
  instance: authInstance,

  signUp: async (email, password, metadata = {}) => {
    if (!authInstance) throw new Error('Firebase not configured');
    const { user } = await createUserWithEmailAndPassword(authInstance, email, password);

    // Set display name
    if (metadata.name) {
      await updateProfile(user, { displayName: metadata.name });
    }

    // Create profile document in Firestore
    await setDoc(doc(firestore, 'profiles', user.uid), {
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
      status: 'Active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return user;
  },

  signIn: async (email, password) => {
    if (!authInstance) throw new Error('Firebase not configured');
    const { user } = await signInWithEmailAndPassword(authInstance, email, password);
    return user;
  },

  signOut: async () => {
    if (!authInstance) throw new Error('Firebase not configured');
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
    if (!authInstance) throw new Error('Firebase not configured');
    await sendPasswordResetEmail(authInstance, email);
  }
};

// =====================
// Database helpers
// =====================
export const db = {
  // --- Profiles ---
  getProfile: async (userId) => {
    if (!firestore) return null;
    const snap = await getDoc(doc(firestore, 'profiles', userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateProfile: async (userId, data) => {
    if (!firestore) return null;
    const ref = doc(firestore, 'profiles', userId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    const snap = await getDoc(ref);
    return { id: snap.id, ...snap.data() };
  },

  // Check if username is already taken
  isUsernameTaken: async (username) => {
    if (!firestore) return false;
    const q = query(
      collection(firestore, 'profiles'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  },

  // --- Applications (healer applications) ---
  submitApplication: async (application) => {
    if (!firestore) return null;
    const ref = await addDoc(collection(firestore, 'applications'), {
      ...application,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: ref.id, ...application };
  },

  getApplications: async () => {
    if (!firestore) return [];
    const q = query(collection(firestore, 'applications'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  updateApplicationStatus: async (appId, status, reviewerId) => {
    if (!firestore) return null;
    const ref = doc(firestore, 'applications', appId);
    await updateDoc(ref, { status, reviewedBy: reviewerId, updatedAt: serverTimestamp() });
  },

  // --- Stories / testimonials ---
  submitStory: async (story) => {
    if (!firestore) return null;
    const ref = await addDoc(collection(firestore, 'stories'), {
      ...story,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { id: ref.id, ...story };
  },

  getApprovedStories: async () => {
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'stories'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getAllStories: async () => {
    if (!firestore) return [];
    const q = query(collection(firestore, 'stories'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  updateStoryStatus: async (storyId, status) => {
    if (!firestore) return null;
    await updateDoc(doc(firestore, 'stories', storyId), { status });
  },

  // --- Session logs ---
  logSession: async (log) => {
    if (!firestore) return null;
    const ref = await addDoc(collection(firestore, 'session_logs'), {
      ...log,
      createdAt: serverTimestamp()
    });
    return { id: ref.id, ...log };
  },

  getSessionLogs: async (userId) => {
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'session_logs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // --- Admin: Team & Clients ---
  getTeamMembers: async () => {
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'profiles'),
      where('role', 'in', ['healer', 'admin', 'owner', 'staff'])
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getAllClients: async () => {
    if (!firestore) return [];
    const q = query(collection(firestore, 'profiles'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  updateRole: async (userId, role) => {
    if (!firestore) return null;
    await updateDoc(doc(firestore, 'profiles', userId), {
      role,
      updatedAt: serverTimestamp()
    });
  }
};
