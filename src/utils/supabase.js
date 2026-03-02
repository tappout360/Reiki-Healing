/**
 * ═══════════════════════════════════════════════════════════════
 *  SUPABASE CLIENT — Cloud Data Layer
 *  Replaces localStorage for persistent, cross-device data.
 *  Falls back to localStorage when offline or misconfigured.
 * ═══════════════════════════════════════════════════════════════
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create a real client if credentials are configured
const isConfigured = supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('REPLACE_ME') &&
  !supabaseAnonKey.includes('REPLACE_ME');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseReady = () => !!supabase;

/**
 * Storage Adapter — Supabase with localStorage fallback
 * Use this throughout the app instead of direct localStorage calls.
 */
const StorageAdapter = {
  // ─── User Auth ───
  async signUp({ email, password, name }) {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;

      // Also create a profile row
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          subscription: 'seeker',
          created_at: new Date().toISOString()
        });
      }
      return data;
    }
    // Fallback: localStorage
    const profile = { email, name, subscription: 'seeker', created_at: new Date().toISOString() };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    return { user: profile };
  },

  async signIn({ email, password }) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }
    // Fallback: localStorage
    const stored = JSON.parse(localStorage.getItem('user_profile') || 'null');
    if (stored && stored.email === email) return { user: stored };
    throw new Error('Invalid credentials');
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('user_profile');
  },

  // ─── Bookings ───
  async createBooking(booking) {
    if (supabase) {
      const { data, error } = await supabase.from('bookings').insert(booking).select().single();
      if (error) throw error;
      return data;
    }
    // Fallback: localStorage
    const bookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    return booking;
  },

  async getBookings(userId = null) {
    if (supabase) {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('aura_bookings') || '[]');
  },

  // ─── Transactions ───
  async recordTransaction(txn) {
    if (supabase) {
      const { data, error } = await supabase.from('transactions').insert(txn).select().single();
      if (error) throw error;
      return data;
    }
    // Fallback: localStorage
    const txns = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
    txns.push(txn);
    localStorage.setItem('aura_transactions', JSON.stringify(txns));
    return txn;
  },

  async getTransactions(userId = null) {
    if (supabase) {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('aura_transactions') || '[]');
  },

  // ─── Energy Logs ───
  async saveEnergyLog(userId, log) {
    if (supabase) {
      const { error } = await supabase.from('energy_logs').insert({ user_id: userId, ...log });
      if (error) throw error;
      return;
    }
    const key = `aura_energy_${userId}`;
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push(log);
    localStorage.setItem(key, JSON.stringify(logs));
  },

  async getEnergyLogs(userId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem(`aura_energy_${userId}`) || '[]');
  },

  // ─── Community ───
  async createPost(post) {
    if (supabase) {
      const { data, error } = await supabase.from('community_posts').insert(post).select().single();
      if (error) throw error;
      return data;
    }
    const posts = JSON.parse(localStorage.getItem('aura_community') || '[]');
    posts.unshift(post);
    localStorage.setItem('aura_community', JSON.stringify(posts));
    return post;
  },

  async getPosts() {
    if (supabase) {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('aura_community') || '[]');
  },

  // ─── User Profile ───
  async updateUser(userId, updates) {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    Object.assign(profile, updates);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    return profile;
  },

  async getUser(userId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('user_profile') || 'null');
  }
};

export default StorageAdapter;
