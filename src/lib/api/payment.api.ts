import {
   PaymentIntentRequest,
   PaymentIntentResponse,
   ConfirmPaymentRequest,
   ConfirmPaymentResponse,
   CreateSubscriptionRequest,
   UpdateSubscriptionRequest,
   CancelSubscriptionRequest,
   SubscriptionResponse,
   PaymentMethodsResponse,
   PaymentHistoryQuery,
   PaymentHistoryResponse,
   PayoutSetupRequest,
   PayoutSetupResponse,
   PayoutAccountStatusResponse,
   PayoutRequest,
   PayoutResponse,
   PayoutHistoryQuery,
   PayoutHistoryResponse,
   EarningsResponse,
   RefundRequest,
   RefundResponse,
   PaymentErrorResponse
} from '@/types/payment.types';

const API_ORIGIN = (
   process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1'
).replace(/\/+$/, '');
const BASE_URL = `${API_ORIGIN}/payments`;

class PaymentAPI {
   private async request<T>(
      endpoint: string,
      options: RequestInit = {}
   ): Promise<T> {
      const url = `${BASE_URL}${endpoint}`;

      const response = await fetch(url, {
         headers: {
            'Content-Type': 'application/json',
            ...options.headers,
         },
         ...options,
      });

      if (!response.ok) {
         const errorData: PaymentErrorResponse = await response.json();
         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
   }

   private getAuthHeaders(token: string) {
      return {
         'Authorization': `Bearer ${token}`,
      };
   }

   // Payment Intent & Processing
   async createPaymentIntent(
      token: string,
      data: PaymentIntentRequest
   ): Promise<PaymentIntentResponse> {
      return this.request<PaymentIntentResponse>('/setup-intent', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   async confirmPayment(
      token: string,
      data: ConfirmPaymentRequest
   ): Promise<ConfirmPaymentResponse> {
      return this.request<ConfirmPaymentResponse>('/confirm', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   // Subscriptions
   async createSubscription(
      token: string,
      data: CreateSubscriptionRequest
   ): Promise<SubscriptionResponse> {
      return this.request<SubscriptionResponse>('/subscriptions', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   async updateSubscription(
      token: string,
      data: UpdateSubscriptionRequest
   ): Promise<SubscriptionResponse> {
      return this.request<SubscriptionResponse>('/subscriptions', {
         method: 'PUT',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   async cancelSubscription(
      token: string,
      data: CancelSubscriptionRequest
   ): Promise<SubscriptionResponse> {
      return this.request<SubscriptionResponse>('/subscriptions', {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   // Payment Methods
   async getPaymentMethods(token: string): Promise<PaymentMethodsResponse> {
      return this.request<PaymentMethodsResponse>('/methods', {
         method: 'GET',
         headers: this.getAuthHeaders(token),
      });
   }

   async deletePaymentMethod(
      token: string,
      paymentMethodId: string
   ): Promise<{ success: boolean; message: string }> {
      return this.request<{ success: boolean; message: string }>(`/methods/${paymentMethodId}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });
   }

   // Payment History
   async getPaymentHistory(
      token: string,
      query: PaymentHistoryQuery = {}
   ): Promise<PaymentHistoryResponse> {
      const params = new URLSearchParams();

      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.status) params.append('status', query.status);
      if (query.paymentType) params.append('paymentType', query.paymentType);

      const queryString = params.toString();
      const endpoint = queryString ? `/history?${queryString}` : '/history';

      return this.request<PaymentHistoryResponse>(endpoint, {
         method: 'GET',
         headers: this.getAuthHeaders(token),
      });
   }

   // Creator Payouts
   async setupPayoutAccount(
      token: string,
      data: PayoutSetupRequest
   ): Promise<PayoutSetupResponse> {
      return this.request<PayoutSetupResponse>('/payouts/setup', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   async getPayoutAccountStatus(token: string): Promise<PayoutAccountStatusResponse> {
      return this.request<PayoutAccountStatusResponse>('/payouts/account-status', {
         method: 'GET',
         headers: this.getAuthHeaders(token),
      });
   }

   async requestPayout(
      token: string,
      data: PayoutRequest
   ): Promise<PayoutResponse> {
      return this.request<PayoutResponse>('/payouts', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }

   async getPayoutHistory(
      token: string,
      query: PayoutHistoryQuery = {}
   ): Promise<PayoutHistoryResponse> {
      const params = new URLSearchParams();

      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.status) params.append('status', query.status);

      const queryString = params.toString();
      const endpoint = queryString ? `/payouts/history?${queryString}` : '/payouts/history';

      return this.request<PayoutHistoryResponse>(endpoint, {
         method: 'GET',
         headers: this.getAuthHeaders(token),
      });
   }

   // Earnings & Analytics
   async getEarnings(token: string): Promise<EarningsResponse> {
      return this.request<EarningsResponse>('/earnings', {
         method: 'GET',
         headers: this.getAuthHeaders(token),
      });
   }

   // Admin Operations
   async refundPayment(
      token: string,
      data: RefundRequest
   ): Promise<RefundResponse> {
      return this.request<RefundResponse>('/refund', {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });
   }
}

export interface WalletAccountSummary {
   id: string | null;
   userId: string;
   balanceCredits: number;
   reservedCredits: number;
   availableCredits: number;
   buckets?: {
      purchased: number;
      subscription: number;
      promo: number;
   };
   currency: 'credits';
   updatedAt: string | null;
}

export interface WalletLedgerEntry {
   _id: string;
   type: string;
   bucket?: 'purchased' | 'subscription' | 'promo' | null;
   amountMinor: number;
   currency: string;
   status: 'posted' | 'pending' | 'voided';
   idempotencyKey?: string;
   refType?: string;
   refId?: string;
   balanceAfter?: number;
   createdAt: string;
}

export interface ReferralSummary {
   referralCode: string;
   policy: {
      referrerPromoCredits: number;
      refereePromoCredits: number;
      maxMonthlyRewardedReferrals: number;
   };
   monthlyRewardedCount: number;
   monthlyRemainingCount: number;
   totalEarnedPromoCredits: number;
   alreadyClaimedAsReferee: boolean;
   referrals: Array<{
      _id: string;
      referralCode: string;
      referrerRewardCredits: number;
      rewardedAt: string;
   }>;
}

export interface AiUsageRecordItem {
   _id: string;
   feature: string;
   promptVersion: string;
   model: string;
   creditCost: number;
   inputTokens: number;
   outputTokens: number;
   status: 'reserved' | 'settled' | 'refunded' | 'failed';
   errorMessage?: string;
   createdAt: string;
}

export interface CreatorChallengeItem {
   _id: string;
   title: string;
   description: string;
   category: string;
   rewardCredits: number;
   currency: 'credits';
   status: string;
   claimsCount: number;
   maxClaims?: number | null;
   mySubmission?: {
      _id: string;
      status: string;
      rewardCreditsAwarded: number;
   } | null;
}

export const paymentAPI = new PaymentAPI();

async function originRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
   const response = await fetch(`${API_ORIGIN}${path}`, {
      ...options,
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
         ...options.headers,
      },
   });

   const payload = await response.json().catch(() => ({}));
   if (!response.ok) {
      throw new Error(payload?.message || `HTTP error! status: ${response.status}`);
   }
   return payload as T;
}

export const walletAPI = {
   getWallet(token: string) {
      return originRequest<{ wallet: WalletAccountSummary; creditPacks: Record<string, number> }>(
         '/wallet',
         token
      );
   },
   getLedger(token: string, page = 1, limit = 25) {
      return originRequest<{
         entries: WalletLedgerEntry[];
         pagination: { page: number; limit: number; total: number; pages: number };
      }>(`/wallet/ledger?page=${page}&limit=${limit}`, token);
   },
   getReconciliation(token: string) {
      return originRequest<{
         balanceMatches: boolean;
         reservedMatches: boolean;
         ledgerPostedBalance: number;
         ledgerReservedCredits: number;
         entryCount: number;
      }>('/wallet/reconcile', token);
   },
   getAiUsage(token: string, limit = 20) {
      return originRequest<{ records: AiUsageRecordItem[] }>(`/wallet/ai-usage?limit=${limit}`, token);
   },
   createTopUpIntent(token: string, credits: number, idempotencyKey: string) {
      return originRequest<{
         clientSecret?: string;
         paymentIntentId: string;
         amountCents: number;
         currency: string;
         creditGrant: number;
      }>('/wallet/topup-intent', token, {
         method: 'POST',
         headers: { 'Idempotency-Key': idempotencyKey },
         body: JSON.stringify({ credits, idempotencyKey }),
      });
   },
   getChallenges(token: string) {
      return originRequest<{ challenges: CreatorChallengeItem[] }>('/challenges', token);
   },
   claimChallenge(token: string, challengeId: string, body: { evidenceUrl?: string; notes?: string }) {
      return originRequest<{
         wallet: WalletAccountSummary;
         ledgerEntry: WalletLedgerEntry;
      }>(`/challenges/${challengeId}/claim`, token, {
         method: 'POST',
         body: JSON.stringify(body),
      });
   },
   getReferrals(token: string) {
      return originRequest<ReferralSummary>('/wallet/referrals', token);
   },
   claimReferral(token: string, referralCode: string, fingerprint?: string) {
      return originRequest<{
         refereeWallet: WalletAccountSummary;
      }>('/wallet/referrals/claim', token, {
         method: 'POST',
         body: JSON.stringify({ referralCode, fingerprint }),
      });
   },
   getCommercialCatalog(token: string) {
      return originRequest<{
         aiTariffs: Record<string, number>;
      }>('/wallet/catalog', token);
   },
};