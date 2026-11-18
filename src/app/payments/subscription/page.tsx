"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { SubscriptionCard } from '@/components/payments/SubscriptionCard';
import { PricingPlans } from '@/components/payments/PricingPlans';
import { PaymentMethods } from '@/components/payments/PaymentForm/PaymentMethods';
import { PricingPlan } from '@/types/payment.types';

const availablePlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    currency: 'usd',
    interval: 'month',
    priceId: 'price_starter_monthly',
    description: '100 AI credits/mo · 60 min studio · 3 hosts · 720p · 5 GB storage.',
    desc: '100 AI credits/mo · 60 min studio · 3 hosts · 720p · 5 GB storage.',
    features: [
      '100 monthly AI credits',
      '60 min live & podcast studio',
      'Up to 3 hosts at 720p',
      '5 GB media storage',
    ],
    tier: 'starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    currency: 'usd',
    interval: 'month',
    priceId: 'price_pro_monthly',
    description: '250 AI credits/mo · 120 min studio · 5 hosts · 1080p · 20 GB storage.',
    desc: '250 AI credits/mo · 120 min studio · 5 hosts · 1080p · 20 GB storage.',
    features: [
      '250 monthly AI credits',
      '120 min live & podcast studio',
      'Up to 5 hosts at 1080p',
      '20 GB media storage',
    ],
    tier: 'pro',
    popular: true,
  },
  {
    id: 'creator_max',
    name: 'Creator Max',
    price: 1999,
    currency: 'usd',
    interval: 'month',
    priceId: 'price_creator_max_monthly',
    description: '600 AI credits/mo · 240 min studio · 8 hosts · 1080p · 100 GB storage.',
    desc: '600 AI credits/mo · 240 min studio · 8 hosts · 1080p · 100 GB storage.',
    features: [
      '600 monthly AI credits',
      '240 min live & podcast studio',
      'Up to 8 hosts at 1080p',
      '100 GB media storage',
    ],
    tier: 'creator_max',
  },
];

function SubscriptionManagement() {
  const router = useRouter();
  const {
    state,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    loadPaymentMethods,
  } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubscription = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      setBanner({
        type: 'error',
        text: 'Select both a plan and a payment method before subscribing.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      setBanner(null);
      const plan = availablePlans.find((p) => p.id === selectedPlan);
      if (!plan) return;

      await createSubscription(plan.priceId, plan.tier, selectedPaymentMethod);
      setBanner({ type: 'success', text: 'Subscription activated.' });
      setShowUpdateForm(false);
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        'Failed to create subscription. Please try again.';
      setBanner({ type: 'error', text: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSubscription = async (newPlanId: string) => {
    try {
      setIsProcessing(true);
      setBanner(null);
      const plan = availablePlans.find((p) => p.id === newPlanId);
      if (!plan) return;

      await updateSubscription(plan.priceId, plan.tier);
      setBanner({ type: 'success', text: 'Subscription plan updated.' });
      setShowUpdateForm(false);
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        'Failed to update subscription. Please try again.';
      setBanner({ type: 'error', text: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      setBanner(null);
      await cancelSubscription(true);
      setConfirmCancel(false);
      setBanner({
        type: 'success',
        text: 'Subscription will end at the close of the current billing period.',
      });
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        'Failed to cancel subscription. Please try again.';
      setBanner({ type: 'error', text: message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Billing & Plans
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Subscription Management
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Manage your active plan tier, billing method, and renewal status.
              </p>
            </div>
            <Link
              href="/payments/history"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View payment history
            </Link>
          </div>

          {banner && (
            <div
              role="status"
              className={`mt-5 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-4 text-xs font-medium underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {confirmCancel && (
            <div
              role="alertdialog"
              aria-label="Confirm subscription cancellation"
              className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-amber-900 dark:text-amber-200">
                Cancel your subscription at the end of the current billing period?
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={isProcessing}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Cancelling...' : 'Confirm cancellation'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  Current Subscription
                </h2>
                {state.subscription ? (
                  <SubscriptionCard
                    subscription={state.subscription}
                    onUpdate={() => setShowUpdateForm(true)}
                    onCancel={() => setConfirmCancel(true)}
                    isLoading={isProcessing}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      No active subscription
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Select a plan on the right to activate creator workspace features.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(true)}
                      className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      Choose plan
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  Payment Methods
                </h3>
                <PaymentMethods
                  selectedMethod={selectedPaymentMethod}
                  onMethodSelect={setSelectedPaymentMethod}
                  onAddNew={() => router.push('/payments/checkout')}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <strong className="font-semibold text-slate-900 dark:text-white">
                  Payout status:
                </strong>{' '}
                Subscription billing runs through Stripe. Creator cash payouts remain disabled pending payment provider underwriting.
              </div>
            </div>

            <div className="space-y-4 lg:col-span-6">
              {showUpdateForm ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {state.subscription ? 'Update subscription' : 'Choose a plan'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <PricingPlans
                    plans={availablePlans}
                    selectedPlan={selectedPlan}
                    onPlanSelect={setSelectedPlan}
                    isLoading={isProcessing}
                  />

                  {selectedPlan && (
                    <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Selected Plan
                        </p>
                        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                          {availablePlans.find((p) => p.id === selectedPlan)?.name} — $
                          {(availablePlans.find((p) => p.id === selectedPlan)?.price || 0) / 100}
                          /month
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={
                          state.subscription
                            ? () => handleUpdateSubscription(selectedPlan)
                            : handleCreateSubscription
                        }
                        disabled={(!state.subscription && !selectedPaymentMethod) || isProcessing}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                      >
                        {isProcessing
                          ? 'Processing...'
                          : state.subscription
                            ? 'Update plan'
                            : 'Subscribe'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Available Plans
                  </h2>
                  <div className="space-y-3">
                    {availablePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {plan.name}
                            </h3>
                            {plan.popular && (
                              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {plan.description}
                          </p>
                          <div className="mt-2.5 flex items-baseline gap-1 tabular-nums">
                            <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                              ${(plan.price / 100).toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              /{plan.interval}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlan(plan.id);
                            setShowUpdateForm(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {state.subscription ? 'Change' : 'Select'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {state.error && (
            <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SubscriptionPage() {
  return (
    <PaymentProvider>
      <SubscriptionManagement />
    </PaymentProvider>
  );
}
