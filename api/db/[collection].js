// Vercel Serverless Function — Unified Dynamic MongoDB Collections Router
import applicationsHandler from '../_db/applications.js';
import auditLogsHandler from '../_db/audit-logs.js';
import bookingsHandler from '../_db/bookings.js';
import healerPayoutsHandler from '../_db/healer-payouts.js';
import profilesHandler from '../_db/profiles.js';
import sessionConsentsHandler from '../_db/session-consents.js';
import sessionLogsHandler from '../_db/session-logs.js';
import storiesHandler from '../_db/stories.js';

const ROUTE_MAP = {
  'applications': applicationsHandler,
  'audit-logs': auditLogsHandler,
  'bookings': bookingsHandler,
  'healer-payouts': healerPayoutsHandler,
  'profiles': profilesHandler,
  'session-consents': sessionConsentsHandler,
  'session-logs': sessionLogsHandler,
  'stories': storiesHandler,
};

export default async function handler(req, res) {
  const { collection } = req.query;
  const targetHandler = ROUTE_MAP[collection];

  if (!targetHandler) {
    return res.status(404).json({
      error: `Collection '${collection}' not found.`,
      availableCollections: Object.keys(ROUTE_MAP)
    });
  }

  return targetHandler(req, res);
}
