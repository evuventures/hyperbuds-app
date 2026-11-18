'use client';

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Lock,
  Receipt,
  UserCheck,
} from 'lucide-react';

interface SettingDestination {
  href: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS_SECTIONS: SettingDestination[] = [
  {
    href: '/settings/account',
    title: 'Account & Identity',
    description: 'Manage email, password, connected social profiles, and session security.',
    category: 'Profile',
    icon: UserCheck,
  },
  {
    href: '/settings/privacy',
    title: 'Privacy & Safety',
    description: 'Control profile visibility, blocked users, and data export or deletion.',
    category: 'Safety',
    icon: Lock,
  },
  {
    href: '/settings/notifications',
    title: 'Notifications',
    description: 'Configure email and in-app delivery for collaboration invites and messages.',
    category: 'Preferences',
    icon: Bell,
  },
  {
    href: '/payments/subscription',
    title: 'Plan & Billing',
    description: 'View active subscription tier, payment methods, and renewal schedule.',
    category: 'Billing',
    icon: CreditCard,
  },
  {
    href: '/payments/history',
    title: 'Payment History',
    description: 'Inspect past invoices, charges, and creator payout readiness status.',
    category: 'Ledger',
    icon: Receipt,
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workspace Configuration
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Account identity, privacy controls, notification routing, and billing management.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {SETTINGS_SECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {item.category}
                      </p>
                      <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
