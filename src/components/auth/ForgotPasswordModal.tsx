'use client';

import React from 'react';
import { Mail, X, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function ForgotPasswordModal({ isOpen, onClose, email }: ForgotPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10 text-center">
          {/* Icon Header */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-linear-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl shadow-purple-500/20">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            We&lsquo;ve sent a password reset link to <br />
            <span className="font-bold text-purple-500">{email}</span>
          </p>

          <div className="space-y-4">
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Got it, thanks!
            </button>
            
            <p className="text-xs text-slate-400">
              Didn&lsquo;t receive the email? Check your spam folder or 
              <button onClick={onClose} className="ml-1 text-purple-600 font-bold hover:underline">try again</button>
            </p>
          </div>
        </div>

        {/* Bottom Success Bar */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-[11px] font-semibold uppercase  text-slate-400">Reset Link Sent Successfully</span>
        </div>
      </div>
    </div>
  );
}