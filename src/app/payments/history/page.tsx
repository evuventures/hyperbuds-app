"use client";

import React from 'react';
import Link from 'next/link';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import { BillingHistory } from '@/components/payments/PaymentForm/BillingHistory';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ArrowUpRight } from 'lucide-react';

function PaymentHistoryPage() {
  const { state } = usePayment();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Billing Ledger
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Payment History
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              View recorded subscription charges, invoices, and billing actions.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <BillingHistory />

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Payment & Payout Information
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Card Processing
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    Subscription payments are processed through Stripe. Card numbers are tokenized by Stripe and never stored on HyperBuds servers.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Creator Payouts
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    Automated creator payouts remain disabled pending payment provider underwriting and compliance approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Billing Destinations
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <Link
                  href="/payments/subscription"
                  className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Manage Subscription
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Update or cancel your plan
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                </Link>

                <Link
                  href="/payments/earnings"
                  className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      View Earnings
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Inspect recorded revenue ledger
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                </Link>

                <Link
                  href="/payments/checkout"
                  className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Add Payment Method
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Checkout or update card
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                </Link>
              </div>
            </div>

            {state.error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
                {state.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentHistoryPageWrapper() {
  return (
    <PaymentProvider>
      <PaymentHistoryPage />
    </PaymentProvider>
  );
}
