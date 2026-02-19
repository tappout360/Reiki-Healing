/**
 * ActionButler — Unified Action Event System
 * Central event bus connecting GoldButler (economy), EtherealButler (suggestions),
 * and Aura AI (knowledge/chat). Every meaningful user action flows through this
 * single system, providing full auditability and enabling context-aware intelligence.
 *
 * HIPAA Note: No PHI is stored. Only operational events (subscription changes,
 * purchases, session completions, AI interactions) with email/name identifiers
 * already present in user_profile.
 */

const ActionButler = {
  // ═══════════════════════════════════════════════════
  // IN-MEMORY SUBSCRIBER SYSTEM (real-time UI updates)
  // ═══════════════════════════════════════════════════

  _subscribers: [],
  _actionCache: null,
  _cacheTimestamp: 0,
  _CACHE_TTL: 5000, // 5 seconds cache for performance

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  },

  _notify(action) {
    this._subscribers.forEach(cb => {
      try { cb(action); } catch (e) { /* subscriber error isolation */ }
    });
  },

  // ═══════════════════════════════════════════════════
  // ACTION ID GENERATION
  // ═══════════════════════════════════════════════════

  generateActionId() {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  },

  // ═══════════════════════════════════════════════════
  // CORE: DISPATCH (Log + Notify — single entry point)
  // ═══════════════════════════════════════════════════

  /**
   * Dispatch an action: log it to localStorage and notify all subscribers.
   * @param {string} email - User email
   * @param {object} action - Action details
   * @param {string} action.category - 'subscription' | 'economy' | 'session' | 'ai' | 'community' | 'account' | 'butler'
   * @param {string} action.type - Specific action type, e.g. 'gold_earned', 'ai_chat', 'session_complete'
   * @param {string} action.description - Human-readable description
   * @param {object} [action.metadata] - Category-specific data
   * @returns {object} The logged action record
   */
  dispatch(email, { category, type, description, metadata = {} }) {
    const record = {
      actionId: this.generateActionId(),
      date: new Date().toISOString(),
      email,
      category,
      type,
      description,
      metadata
    };

    // Persist to per-user action log
    const actions = this.getActions(email);
    actions.push(record);

    // Performance: cap at 500 actions per user to prevent localStorage bloat
    const trimmed = actions.length > 500 ? actions.slice(-500) : actions;
    localStorage.setItem(`aura_actions_${email}`, JSON.stringify(trimmed));

    // Invalidate cache
    this._actionCache = null;

    // Notify subscribers
    this._notify(record);

    return record;
  },

  // ═══════════════════════════════════════════════════
  // QUERY: Per-User Actions
  // ═══════════════════════════════════════════════════

  /**
   * Get actions for a user, optionally filtered.
   * @param {string} email
   * @param {object} [opts]
   * @param {string} [opts.category] - Filter by category
   * @param {string} [opts.type] - Filter by type
   * @param {number} [opts.limit] - Max results (most recent first)
   * @param {number} [opts.sinceDays] - Only actions from last N days
   * @returns {Array} Action records
   */
  getActions(email, opts = {}) {
    let actions = JSON.parse(localStorage.getItem(`aura_actions_${email}`) || '[]');

    if (opts.category) {
      actions = actions.filter(a => a.category === opts.category);
    }
    if (opts.type) {
      actions = actions.filter(a => a.type === opts.type);
    }
    if (opts.sinceDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - opts.sinceDays);
      actions = actions.filter(a => new Date(a.date) >= cutoff);
    }
    if (opts.limit) {
      actions = actions.slice(-opts.limit);
    }

    return actions;
  },

  // ═══════════════════════════════════════════════════
  // QUERY: System-Wide Actions (Admin Dashboard)
  // ═══════════════════════════════════════════════════

  getAllActions(opts = {}) {
    const now = Date.now();

    // Use cached result if fresh enough and no filters
    if (!opts.category && !opts.type && !opts.limit && !opts.sinceDays) {
      if (this._actionCache && (now - this._cacheTimestamp) < this._CACHE_TTL) {
        return this._actionCache;
      }
    }

    const allActions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('aura_actions_')) {
        try {
          const actions = JSON.parse(localStorage.getItem(key) || '[]');
          allActions.push(...actions);
        } catch (e) { /* skip corrupted entries */ }
      }
    }

    // Sort newest first
    allActions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply filters
    let result = allActions;
    if (opts.category) {
      result = result.filter(a => a.category === opts.category);
    }
    if (opts.type) {
      result = result.filter(a => a.type === opts.type);
    }
    if (opts.sinceDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - opts.sinceDays);
      result = result.filter(a => new Date(a.date) >= cutoff);
    }
    if (opts.limit) {
      result = result.slice(0, opts.limit);
    }

    // Cache unfiltered result
    if (!opts.category && !opts.type && !opts.limit && !opts.sinceDays) {
      this._actionCache = result;
      this._cacheTimestamp = now;
    }

    return result;
  },

  // ═══════════════════════════════════════════════════
  // ANALYTICS: User Action Summary
  // ═══════════════════════════════════════════════════

  /**
   * Quick stats for a user — useful for EtherealButler + AI context.
   * @param {string} email
   * @returns {object} Summary object
   */
  getActionSummary(email) {
    const actions = this.getActions(email);
    if (actions.length === 0) {
      return { totalActions: 0, lastActive: null, categoryCounts: {}, recentTypes: [] };
    }

    const categoryCounts = {};
    actions.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    const last7Days = actions.filter(a => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return new Date(a.date) >= cutoff;
    });

    const recentTypes = [...new Set(last7Days.map(a => a.type))];

    return {
      totalActions: actions.length,
      lastActive: actions[actions.length - 1]?.date || null,
      categoryCounts,
      recentTypes,
      actionsThisWeek: last7Days.length,
      topCategory: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    };
  },

  // ═══════════════════════════════════════════════════
  // ANALYTICS: System-Wide Stats (Admin Dashboard)
  // ═══════════════════════════════════════════════════

  getSystemStats() {
    const all = this.getAllActions();
    const today = new Date().toISOString().split('T')[0];
    const todayActions = all.filter(a => a.date.startsWith(today));

    const categoryCounts = {};
    all.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    const uniqueUsers = new Set(all.map(a => a.email)).size;

    return {
      totalActions: all.length,
      todayActions: todayActions.length,
      uniqueUsers,
      categoryCounts,
      recentActions: all.slice(0, 20)
    };
  },

  // ═══════════════════════════════════════════════════
  // CONVENIENCE DISPATCHERS
  // ═══════════════════════════════════════════════════

  // Economy actions (called by GoldButler)
  logGoldEarned(email, amount, reason) {
    return this.dispatch(email, {
      category: 'economy',
      type: 'gold_earned',
      description: `Earned ${amount} gold: ${reason}`,
      metadata: { amount, reason }
    });
  },

  logGoldSpent(email, amount, itemName, newBalance) {
    return this.dispatch(email, {
      category: 'economy',
      type: 'gold_spent',
      description: `Spent ${amount} gold on ${itemName}`,
      metadata: { amount, itemName, newBalance }
    });
  },

  logGoldGift(email, amount, giverName) {
    return this.dispatch(email, {
      category: 'economy',
      type: 'gold_gift',
      description: `Received ${amount} gold from ${giverName}`,
      metadata: { amount, giverName }
    });
  },

  // Session actions (called by App.jsx)
  logSessionStart(email, protocolName) {
    return this.dispatch(email, {
      category: 'session',
      type: 'session_start',
      description: `Started protocol: ${protocolName}`,
      metadata: { protocolName }
    });
  },

  logSessionComplete(email, protocolName, duration) {
    return this.dispatch(email, {
      category: 'session',
      type: 'session_complete',
      description: `Completed protocol: ${protocolName}`,
      metadata: { protocolName, duration }
    });
  },

  // Subscription actions (called by UserDashboard + App.jsx)
  logSubscriptionCancel(email, endDate, userName) {
    return this.dispatch(email, {
      category: 'subscription',
      type: 'subscription_cancelled',
      description: `Subscription cancelled. Active until ${endDate}. User: ${userName}`,
      metadata: { endDate, userName }
    });
  },

  logSubscriptionExpired(email, userName) {
    return this.dispatch(email, {
      category: 'subscription',
      type: 'subscription_expired',
      description: `Subscription expired. Downgraded to Seeker. User: ${userName}`,
      metadata: { userName }
    });
  },

  // AI actions (called by AIHealerInterface)
  logAIChat(email, topic, queryLength) {
    return this.dispatch(email, {
      category: 'ai',
      type: 'ai_chat',
      description: `AI consultation: ${topic}`,
      metadata: { topic, queryLength }
    });
  },

  // Butler actions (called by EtherealButler)
  logButlerAction(email, suggestionId, title) {
    return this.dispatch(email, {
      category: 'butler',
      type: 'butler_suggestion_clicked',
      description: `Butler suggestion followed: ${title}`,
      metadata: { suggestionId }
    });
  },

  // Account actions
  logLogin(email) {
    return this.dispatch(email, {
      category: 'account',
      type: 'login',
      description: 'User logged in',
      metadata: {}
    });
  },

  logSignup(email, accountType) {
    return this.dispatch(email, {
      category: 'account',
      type: 'signup',
      description: `New account created: ${accountType}`,
      metadata: { accountType }
    });
  }
};

export default ActionButler;
