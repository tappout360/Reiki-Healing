/**
 * Centralized Logging Utility for Reiki & Sage
 * Handles standardized logging of all system transactions to localStorage.
 */

export const logTransaction = (action, user, email, details = null) => {
    try {
        const logs = JSON.parse(localStorage.getItem('healing_logs') || '[]');
        
        const newLog = {
            action,
            user: user || 'Unknown Spirit',
            email: email || 'No Email',
            details: details || '',
            timestamp: new Date().toISOString()
        };

        logs.push(newLog);
        
        // Keep logs manageable (limit to last 1000 entries)
        if (logs.length > 1000) {
            logs.shift();
        }

        localStorage.setItem('healing_logs', JSON.stringify(logs));
        console.log(`[SYSTEM LOG] ${action}:`, newLog);

        // Sync Audit Log to MongoDB Serverless Backend
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        fetch('/api/db/audit-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorName: profile.name || 'Master Owner',
                actorEmail: profile.email || 'jasonmounts77@yahoo.com',
                category: action.includes('Status') ? 'ACCOUNT_STATUS' : action.includes('Role') ? 'ROLE_UPGRADE' : action.includes('Price') ? 'PRICING_CHANGE' : 'MODERATION',
                action,
                targetEmail: email || '',
                details: details || `${action} for ${user || email}`
            })
        }).catch(err => console.warn('Audit log serverless sync notice:', err.message));

        return true;
    } catch (error) {
        console.error("Failed to log transaction:", error);
        return false;
    }
};

export const getLogs = () => {
    try {
        return JSON.parse(localStorage.getItem('healing_logs') || '[]');
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return [];
    }
};
