import { SessionRepositoryPort } from '../../ports/SessionRepositoryPort.js';
import { Session } from '../../domain/sessions/Session.js';

/**
 * Driven Adapter: LocalSessionRepository
 * Implements SessionRepositoryPort using localStorage with domain Session hydration.
 */
export class LocalSessionRepository extends SessionRepositoryPort {
  constructor(storageKey = 'aura_sessions') {
    super();
    this.storageKey = storageKey;
  }

  _loadAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  _saveAll(list) {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async save(session) {
    const all = this._loadAll();
    const idx = all.findIndex(s => s.id === session.id);
    const serialized = {
      id: session.id,
      healerId: session.healerId,
      seekerId: session.seekerId,
      serviceType: session.serviceType,
      price: session.price.amount,
      status: session.status,
      date: session.date,
      timeSlot: session.timeSlot,
      rating: session.rating,
      tip: session.tip ? { amount: session.tip.amount } : null,
      createdAt: session.createdAt,
    };

    if (idx >= 0) {
      all[idx] = serialized;
    } else {
      all.push(serialized);
    }
    this._saveAll(all);
    return session;
  }

  async findById(sessionId) {
    const all = this._loadAll();
    const found = all.find(s => s.id === sessionId);
    return found ? new Session(found) : null;
  }

  async findBySeeker(seekerId) {
    const all = this._loadAll();
    return all.filter(s => s.seekerId === seekerId).map(s => new Session(s));
  }
}
