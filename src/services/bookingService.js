/**
 * Booking Domain Service
 * Encapsulates booking creation, persistence, and Seeker verification.
 */
import { isFirebaseConfigured, db } from '../lib/firebase';

export const bookingService = {
  getLocalBookings() {
    try {
      return JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    } catch (e) {
      console.error('Failed to load local bookings:', e);
      return [];
    }
  },

  saveLocalBooking(booking) {
    try {
      const list = this.getLocalBookings();
      list.push(booking);
      localStorage.setItem('aura_bookings', JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to save local booking:', e);
      return false;
    }
  },

  async getUserBookings(seekerEmail) {
    if (!seekerEmail) return [];
    if (isFirebaseConfigured()) {
      try {
        const cloudBookings = await db.getUserBookings(seekerEmail);
        if (cloudBookings && cloudBookings.length > 0) {
          return cloudBookings.sort((a, b) => new Date(b.date || b.bookingDate) - new Date(a.date || a.bookingDate));
        }
      } catch (err) {
        console.warn('Firebase booking fetch fallback to local:', err);
      }
    }
    const local = this.getLocalBookings();
    return local.filter(b => {
      const email = b.client?.email || b.customerEmail || '';
      return email.toLowerCase() === seekerEmail.toLowerCase();
    }).sort((a, b) => new Date(b.date || b.bookingDate) - new Date(a.date || a.bookingDate));
  }
};
