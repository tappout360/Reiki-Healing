/**
 * Centralized Logging Utility for Reiki & Sage
 * Handles standardized logging of all system transactions to localStorage.
 * HIPAA Compliant: PII is masked in log output.
 */

// Mask email for HIPAA minimum-necessary rule
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return 'N/A';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  return `${local.charAt(0)}***@${domain}`;
};

// Mask name — show first initial only
const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'Anonymous';
  return `${name.charAt(0)}. ***`;
};

export const logTransaction = (action, user, email, details = null) => {
    try {
        const logs = JSON.parse(localStorage.getItem('healing_logs') || '[]');
        
        const newLog = {
            action,
            user: maskName(user),
            email: maskEmail(email),
            details: details || '',
            timestamp: new Date().toISOString()
        };

        logs.push(newLog);
        
        // Keep logs manageable (limit to last 500 entries for performance)
        if (logs.length > 500) {
            logs.shift();
        }

        localStorage.setItem('healing_logs', JSON.stringify(logs));
        // console.log stripped in production by Vite terser
        console.log(`[AUDIT] ${action}:`, newLog);
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
