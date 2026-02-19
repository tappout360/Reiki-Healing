/**
 * GoldButler — Centralized Gold Economy Management System
 * Handles all gold storage, transactions, user profiles, and account number management.
 * Acts as the single source of truth for all gold-related data flow.
 */

import ActionButler from './actionButler';

const GoldButler = {
  // ═══════════════════════════════════════════════════
  // ACCOUNT NUMBER MANAGEMENT
  // ═══════════════════════════════════════════════════
  
  generateAccountNumber() {
    return `AUR-${String(10000 + Math.floor(Math.random() * 90000))}`;
  },

  getOrCreateAccountNumber(email) {
    const profile = this.getUserProfile(email);
    if (profile.accountNumber) return profile.accountNumber;
    const acct = this.generateAccountNumber();
    profile.accountNumber = acct;
    this.saveUserProfile(email, profile);
    return acct;
  },

  // ═══════════════════════════════════════════════════
  // USER PROFILE (Unified Personal File)
  // ═══════════════════════════════════════════════════

  getUserProfile(email) {
    return JSON.parse(localStorage.getItem(`aura_profile_${email}`) || localStorage.getItem('user_profile') || '{}');
  },

  saveUserProfile(email, profile) {
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem(`aura_profile_${email}`, JSON.stringify(profile));
  },

  getGoldBalance(email) {
    const profile = this.getUserProfile(email);
    return profile.gold || 0;
  },

  setGoldBalance(email, amount) {
    const profile = this.getUserProfile(email);
    profile.gold = amount;
    this.saveUserProfile(email, profile);
    return amount;
  },

  // ═══════════════════════════════════════════════════
  // TRANSACTION LEDGER
  // ═══════════════════════════════════════════════════

  generateTxnId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  },

  logTransaction(email, { type, amount, balance, accountNumber, description }) {
    const txns = this.getTransactions(email);
    const txn = {
      txnId: this.generateTxnId(),
      date: new Date().toISOString(),
      type,       // 'earned', 'spent', 'gift'
      amount,
      balance,
      accountNumber: accountNumber || this.getOrCreateAccountNumber(email),
      description
    };
    txns.push(txn);
    localStorage.setItem(`aura_transactions_${email}`, JSON.stringify(txns));
    return txn;
  },

  getTransactions(email) {
    return JSON.parse(localStorage.getItem(`aura_transactions_${email}`) || '[]');
  },

  getAllSystemTransactions() {
    const allTxns = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('aura_transactions_')) {
        const txns = JSON.parse(localStorage.getItem(key) || '[]');
        allTxns.push(...txns);
      }
    }
    return allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // ═══════════════════════════════════════════════════
  // PURCHASE ARCHIVE (Per-User Personal File)
  // ═══════════════════════════════════════════════════

  getPurchasedItemIds(email) {
    return JSON.parse(localStorage.getItem(`aura_purchased_${email}`) || '[]');
  },

  savePurchasedItemIds(email, items) {
    localStorage.setItem(`aura_purchased_${email}`, JSON.stringify(items));
  },

  getArchive(email) {
    return JSON.parse(localStorage.getItem(`aura_archive_${email}`) || '[]');
  },

  addToArchive(email, item) {
    const archive = this.getArchive(email);
    archive.push({ ...item, purchasedAt: new Date().toISOString() });
    localStorage.setItem(`aura_archive_${email}`, JSON.stringify(archive));
    return archive;
  },

  // ═══════════════════════════════════════════════════
  // EQUIPPED AVATAR ACCESSORIES
  // ═══════════════════════════════════════════════════

  getEquippedAvatar(email) {
    return JSON.parse(localStorage.getItem(`aura_equipped_${email}`) || '{}');
  },

  equipItem(email, item) {
    const equipped = this.getEquippedAvatar(email);
    equipped[item.avatarSlot] = item;
    localStorage.setItem(`aura_equipped_${email}`, JSON.stringify(equipped));
    return equipped;
  },

  unequipSlot(email, slot) {
    const equipped = this.getEquippedAvatar(email);
    delete equipped[slot];
    localStorage.setItem(`aura_equipped_${email}`, JSON.stringify(equipped));
    return equipped;
  },

  // ═══════════════════════════════════════════════════
  // GOLD OPERATIONS (High-Level)
  // ═══════════════════════════════════════════════════

  /**
   * Give gold to a user (healer action)
   * @returns {object} Transaction record
   */
  giveGold(email, amount, giverName = 'Healer') {
    const balance = this.getGoldBalance(email) + amount;
    this.setGoldBalance(email, balance);
    ActionButler.logGoldGift(email, amount, giverName);
    return this.logTransaction(email, {
      type: 'gift',
      amount,
      balance,
      description: `Gift from ${giverName}`
    });
  },

  /**
   * Earn gold (user action — daily checkin, sessions, etc.)
   * @returns {object} Transaction record
   */
  earnGold(email, amount, reason) {
    const balance = this.getGoldBalance(email) + amount;
    this.setGoldBalance(email, balance);
    ActionButler.logGoldEarned(email, amount, reason);
    return this.logTransaction(email, {
      type: 'earned',
      amount,
      balance,
      description: reason
    });
  },

  /**
   * Spend gold on a purchase
   * @returns {number|false} New balance or false if insufficient
   */
  spendGold(email, amount, itemName) {
    const currentBalance = this.getGoldBalance(email);
    if (currentBalance < amount) return false;
    const newBalance = currentBalance - amount;
    this.setGoldBalance(email, newBalance);
    this.logTransaction(email, {
      type: 'spent',
      amount,
      balance: newBalance,
      description: `Purchased: ${itemName}`
    });
    ActionButler.logGoldSpent(email, amount, itemName, newBalance);
    return newBalance;
  },

  /**
   * Mass gold bonus — give gold to all registered clients
   * @returns {number} Number of clients who received gold
   */
  massGoldBonus(amount, reason) {
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    let count = 0;
    clients.forEach(client => {
      client.gold = (client.gold || 0) + amount;
      this.logTransaction(client.email, {
        type: 'gift',
        amount,
        balance: client.gold,
        accountNumber: client.accountNumber,
        description: reason || 'Mass bonus from Healer'
      });
      count++;
    });
    localStorage.setItem('aura_clients', JSON.stringify(clients));
    return count;
  },

  // ═══════════════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════════════

  getGoldStats() {
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const totalGold = clients.reduce((sum, c) => sum + (c.gold || 0), 0);
    const allTxns = this.getAllSystemTransactions();
    const totalEarned = allTxns.filter(t => t.type === 'earned' || t.type === 'gift').reduce((s, t) => s + t.amount, 0);
    const totalSpent = allTxns.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
    return {
      totalGoldInCirculation: totalGold,
      totalTransactions: allTxns.length,
      totalEarned,
      totalSpent,
      activeClients: clients.filter(c => (c.gold || 0) > 0).length
    };
  }
};

export default GoldButler;
