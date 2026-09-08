import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Calendar, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { healerAdminService } from './services/healerAdminService.js';

export const AdminCarissaReviewConsole = () => {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const applications = healerAdminService.getApplicationsByStatus(activeFilter === 'all' ? null : activeFilter);

  const handleApprove = (appId) => {
    const res = healerAdminService.approveApplication(appId, 'Carissa');
    toast.success('Healer approved! Single-use onboarding link generated.');
    navigator.clipboard.writeText(res.onboardingLink);
    toast.success('Onboarding link copied to clipboard.');
    setSelectedApp(null);
  };

  const handleScheduleInterview = (appId) => {
    if (!interviewDate) {
      toast.error('Please pick an interview date/time.');
      return;
    }
    healerAdminService.scheduleInterview(appId, interviewDate, adminNotes);
    toast.success('Interview recorded.');
    setSelectedApp(null);
    setInterviewDate('');
    setAdminNotes('');
  };

  const handleDecline = (appId) => {
    healerAdminService.declineApplication(appId, 'Not aligned with Sanctuary criteria at this time', 'Carissa');
    toast.success('Application marked as declined.');
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-amber-200 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Carissa's Healer Approval Console
          </h1>
          <p className="text-sm text-stone-400">
            Review incoming practitioner applications, manage interviews, and issue single-use onboarding invitations.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-stone-900 border border-white/10 text-xs">
          {['pending', 'interview_scheduled', 'approved', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                activeFilter === filter ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <p className="text-stone-400 text-sm">No applications in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl border border-amber-500/20 bg-stone-900/80 backdrop-blur-xl shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-stone-100">{app.applicantName}</h3>
                  <p className="text-xs text-stone-400">{app.email} | {app.phone || 'No phone'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {app.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-stone-300 space-y-1">
                <p><strong>Experience:</strong> {app.experienceYears || 2} Years</p>
                <p><strong>Modalities:</strong> {(app.modalities || []).join(', ')}</p>
                {app.serviceZip && <p><strong>Service ZIP:</strong> {app.serviceZip}</p>}
              </div>

              {app.status === 'pending' && (
                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold text-xs hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Send Link
                  </button>
                  <button
                    onClick={() => handleDecline(app.id)}
                    className="px-3 py-2 rounded-xl bg-stone-800 text-rose-300 text-xs hover:bg-rose-950/40 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              )}

              {app.onboardingToken && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-xs flex items-center justify-between">
                  <span className="text-stone-400 truncate max-w-[200px]">Token: {app.onboardingToken}</span>
                  <button
                    onClick={() => {
                      const link = `https://reikiandsage.com/onboard/healer?token=${app.onboardingToken}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Link copied!');
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy Link
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
