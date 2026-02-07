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
