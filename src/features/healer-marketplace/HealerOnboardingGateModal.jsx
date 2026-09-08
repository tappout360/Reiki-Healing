import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck, FileText, CreditCard, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { HealerOnboardingStateMachine, OnboardingSteps } from './domain/HealerOnboardingStateMachine.js';

export const HealerOnboardingGateModal = ({ healer, onCompleteAll }) => {
  const [stateMachine, setStateMachine] = useState(() => 
    new HealerOnboardingStateMachine(healer?.onboardingStatus || {})
  );

  const status = stateMachine.getStatus();

  const handleStepComplete = (stepKey, label) => {
    const updated = stateMachine.completeStep(stepKey);
    setStateMachine(new HealerOnboardingStateMachine(updated));
    toast.success(`Step completed: ${label}`);

    if (updated.isFullyActivated && onCompleteAll) {
      onCompleteAll(updated);
      toast.success('Congratulations! You are now an Active, Payout-Ready Sanctuary Healer.');
    }
  };

  const stepsConfig = [
    {
      key: OnboardingSteps.ACCOUNT_CLAIMED,
      title: '1. Account Claim & Authentication',
      desc: 'Verify your sacred practitioner account and security credentials.',
      icon: UserCheck
    },
    {
      key: OnboardingSteps.AGREEMENT_SIGNED,
      title: '2. Independent Practitioner Agreement (1099)',
      desc: 'Sign terms establishing 1099 contractor status, 15% platform commission on sessions, and 100% tip guarantee.',
      icon: FileText
    },
    {
      key: OnboardingSteps.HANDBOOK_SIGNED,
      title: '3. Healer Handbook & Non-Medical Code of Ethics',
      desc: 'Affirm FTC/FDA wellness boundaries, zero PHI collection, and the 24-hr appointment response standard.',
      icon: ShieldCheck
    },
    {
      key: OnboardingSteps.TAX_ACKNOWLEDGED,
      title: '4. Tax Responsibility (Form W-9 & 1099-NEC)',
      desc: 'Acknowledge independent tax filing responsibilities and electronic 1099-NEC delivery.',
      icon: FileText
    },
    {
      key: OnboardingSteps.STRIPE_CONNECTED,
      title: '5. Stripe Express Bank & Payout Connection',
      desc: 'Link your direct deposit checking account or debit card for instant session and tip payouts.',
      icon: CreditCard
    },
    {
      key: OnboardingSteps.AVAILABILITY_CONFIGURED,
      title: '6. Availability, Buffers & Service Radius',
      desc: 'Define your working hours, 15-minute integration buffers, and in-person travel radius (up to 50 miles).',
      icon: Clock
    },
    {
      key: OnboardingSteps.PROFILE_COMPLETED,
      title: '7. Public Directory Profile & Modalities',
      desc: 'Publish your sacred bio, profile photo, and specialized energy/sound modalities for seekers.',
      icon: Sparkles
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-black border border-amber-500/30 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Activation Gate
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-amber-200">
            Welcome to the Healer Sanctuary
          </h2>
          <p className="text-xs md:text-sm text-stone-400 max-w-md mx-auto">
            Please complete these 7 sacred readiness steps to activate your booking calendar and begin receiving seeker appointments.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(status.completedCount / status.totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-300/80 font-medium">
            {status.completedCount} of {status.totalSteps} steps completed
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {stepsConfig.map((step) => {
            const isDone = status[step.key];
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                  isDone 
                    ? 'border-emerald-500/30 bg-emerald-950/20' 
                    : 'border-white/10 bg-stone-900/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-200">{step.title}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>

                {isDone ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </span>
                ) : (
                  <button
                    onClick={() => handleStepComplete(step.key, step.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-semibold hover:brightness-110 transition whitespace-nowrap cursor-pointer"
                  >
                    Complete Step
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Bookings unlock only upon 100% completion
          </span>
          {status.isFullyActivated && (
            <span className="text-emerald-400 font-medium">Ready for Sacred Activation!</span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
