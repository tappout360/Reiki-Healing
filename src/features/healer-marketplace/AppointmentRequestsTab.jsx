import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, XCircle, ArrowRightCircle, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AppointmentRequestsTab = ({ requests = [], onAccept, onDecline, onProposeAlternative }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [altSlotInput, setAltSlotInput] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'decline' | 'alternative'

  const handleAccept = (req) => {
    if (onAccept) onAccept(req.id);
    toast.success(`Accepted appointment with ${req.seekerName}. Video room provisioned.`);
  };

  const submitDecline = () => {
    if (onDecline && selectedReq) onDecline(selectedReq.id, declineReason || 'Schedule conflict');
    toast.success('Appointment declined with compassion. Seeker has been refunded.');
    setActiveModal(null);
    setSelectedReq(null);
  };

  const submitAlternative = () => {
    if (!altSlotInput) {
      toast.error('Please specify an alternative date/time.');
      return;
    }
    if (onProposeAlternative && selectedReq) onProposeAlternative(selectedReq.id, [altSlotInput]);
    toast.success('Alternative time sent to seeker. They have 24 hours to confirm.');
    setActiveModal(null);
    setSelectedReq(null);
    setAltSlotInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-amber-200/90 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Appointment Requests
          </h2>
          <p className="text-sm text-amber-200/60 mt-1">
            Review incoming seeker booking requests. 24-hour response standard applies.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {requests.filter(r => r.status === 'pending_healer').length} Pending Action
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/10 bg-black/40 text-center backdrop-blur-md">
          <Calendar className="w-10 h-10 text-amber-400/40 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No pending appointment requests right now.</p>
          <p className="text-xs text-stone-500 mt-1">Your schedule is serene and aligned.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-stone-900/90 to-purple-950/40 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-stone-100">{req.seekerName}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                    {req.serviceType.replace('_', ' ')}
                  </span>
                  {req.status === 'accepted' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Confirmed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {new Date(req.slotUtc).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="text-amber-200/80 font-medium">
                    Fee: ${req.price} | Net Payout (80%): ${(req.price * 0.80).toFixed(2)}
                  </span>
                </div>

                {req.intentionTags && req.intentionTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {req.intentionTags.map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800/80 text-amber-300/80 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {req.status === 'pending_healer' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-medium text-xs hover:brightness-110 transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept
                  </button>

                  <button
                    onClick={() => { setSelectedReq(req); setActiveModal('alternative'); }}
                    className="px-3 py-2 rounded-xl bg-purple-900/40 text-purple-200 border border-purple-500/30 text-xs hover:bg-purple-800/50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                    Alternative
                  </button>

                  <button
                    onClick={() => { setSelectedReq(req); setActiveModal('decline'); }}
                    className="px-3 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs hover:bg-rose-950/40 hover:text-rose-300 border border-white/5 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Alternative Slot Modal */}
      <AnimatePresence>
        {activeModal === 'alternative' && selectedReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-stone-900 border border-amber-500/30 shadow-2xl space-y-4">
              <h3 className="text-lg font-serif text-amber-200">Propose Alternative Time</h3>
              <p className="text-xs text-stone-400">
                Offer a different time slot that aligns better with your energy and schedule.
              </p>
              <input
                type="text"
                placeholder="e.g. Thursday at 4:00 PM PDT"
                value={altSlotInput}
                onChange={(e) => setAltSlotInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-stone-100 text-sm focus:border-amber-400 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAlternative}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-medium hover:brightness-110"
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decline Modal */}
      <AnimatePresence>
        {activeModal === 'decline' && selectedReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-stone-900 border border-rose-500/30 shadow-2xl space-y-4">
              <h3 className="text-lg font-serif text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Decline Appointment
              </h3>
              <p className="text-xs text-stone-400">
                The seeker will receive a 100% refund immediately and Aura OS will suggest peer healers.
              </p>
              <textarea
                rows={3}
                placeholder="Brief compassionate note (e.g. at daily capacity, travel schedule)..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-stone-100 text-sm focus:border-rose-400 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={submitDecline}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
                >
                  Confirm Decline & Refund
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
