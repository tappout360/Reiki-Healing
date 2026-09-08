import React from 'react';
import { ShieldCheck, FileCheck, Download, Award, ExternalLink } from 'lucide-react';

export const AgreementsCenterTab = ({ healer, signedAgreements = [] }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif text-amber-200/90 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Agreements & Tax Center
        </h2>
        <p className="text-sm text-amber-200/60 mt-1">
          Your signed legal documents, independent contractor terms, and 1099 tax disclosures.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 1099 Posture Card */}
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-stone-900/60 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-medium text-sm">
            <Award className="w-4 h-4" />
            Independent Practitioner Posture
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            You operate as an independent 1099 practitioner. You have sovereign authority over your schedule, clients, and modalities. You maintain your own professional insurance and tax reporting.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-300">
            <span>Platform Commission: <strong className="text-amber-300">20% on sessions</strong></span>
            <span>Tips: <strong className="text-emerald-300">100% to You</strong></span>
          </div>
        </div>

        {/* Stripe Express Card */}
        <div className="p-5 rounded-2xl border border-purple-500/20 bg-stone-900/60 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-medium text-sm">Stripe Express & 1099-NEC</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Payouts
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Payouts are deposited directly to your linked bank account. Stripe Express handles automated electronic W-9 verification and annual Form 1099-NEC delivery.
          </p>
          <button
            onClick={() => window.open('https://connect.stripe.com/express_login', '_blank')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            Open Stripe Express Dashboard <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Signed Documents Table */}
      <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-medium text-stone-200">Executed Contracts & Sign-Offs</h3>
        <div className="divide-y divide-white/5">
          <div className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-stone-200">Independent Practitioner Agreement (v2026.2)</p>
                <p className="text-stone-500 text-[11px]">Signed on {new Date().toLocaleDateString()} | 20% Commission / 80% Payout / 100% Tips</p>
              </div>
            </div>
            <button className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1">
              <Download className="w-3 h-3" /> PDF
            </button>
          </div>

          <div className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-stone-200">Independent Practitioner Handbook (19 Sections, v2026.2)</p>
                <p className="text-stone-500 text-[11px]">Signed on {new Date().toLocaleDateString()} | FTC/FDA & HIPAA Safe Harbor Verified</p>
              </div>
            </div>
            <button className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1">
              <Download className="w-3 h-3" /> PDF
            </button>
          </div>

          <div className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-stone-200">Tax & Bookkeeping Responsibility Acknowledgment (Form W-9 & 1099-NEC)</p>
                <p className="text-stone-500 text-[11px]">Signed electronically via Stripe Express | Sovereign Filing</p>
              </div>
            </div>
            <button className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1">
              <Download className="w-3 h-3" /> Summary
            </button>
          </div>

          <div className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-stone-200">Client Privacy & Sanctuary Boundaries Addendum (v2026.2)</p>
                <p className="text-stone-500 text-[11px]">Signed on {new Date().toLocaleDateString()} | Non-PHI Sacred Discretion</p>
              </div>
            </div>
            <button className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1">
              <Download className="w-3 h-3" /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
