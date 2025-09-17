import {
   PaymentIntent,
   PaymentIntentResponse,
   PaymentConfirmation,
   PaymentConfirmationResponse,
   Subscription,
   SubscriptionResponse,
   SubscriptionUpdate,
   SubscriptionCancel,
   PaymentMethodsResponse,
   PaymentHistoryQuery,
   PaymentHistoryResponse,
   PayoutSetup,
   PayoutSetupResponse,
   PayoutAccountStatus,
   PayoutRequest,
   PayoutRequestResponse,
   PayoutHistoryQuery,
   PayoutHistoryResponse,
   EarningsSummary,
   RefundRequest,
   RefundResponse,
   PaymentError
} from '@/types/payment.types';

const API_BASE_URL = 'https://api.hyperbuds.com/api/v1/payments';

class PaymentAPI {
   private async getAuthHeaders(): Promise<HeadersInit> {
      // Get token from auth store or localStorage
      const token = typeof window !== 'undefined'
         ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
         : null;

      if (!token) {
         // Return headers without auth for now - backend will handle auth
         return {
            'Content-Type': 'application/json',
         };
      }

      return {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
      };
   }

   private async handleResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
         const errorData: PaymentError = await response.json();
         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
   }

   // Payment Intents & Processing
   async createPaymentIntent(intent: PaymentIntent): Promise<PaymentIntentResponse> {
      const response = await fetch(`${API_BASE_URL}/setup-intent`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(intent),
      });

      return this.handleResponse<PaymentIntentResponse>(response);
   }

   async confirmPayment(confirmation: PaymentConfirmation): Promise<PaymentConfirmationResponse> {
      const response = await fetch(`${API_BASE_URL}/confirm`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(confirmation),
      });

      return this.handleResponse<PaymentConfirmationResponse>(response);
   }

   // Subscriptions
   async createSubscription(subscription: Subscription): Promise<SubscriptionResponse> {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(subscription),
      });

      return this.handleResponse<SubscriptionResponse>(response);
   }

   async updateSubscription(update: SubscriptionUpdate): Promise<SubscriptionResponse> {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
         method: 'PUT',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(update),
      });

      return this.handleResponse<SubscriptionResponse>(response);
   }

   async cancelSubscription(cancel: SubscriptionCancel): Promise<SubscriptionResponse> {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
         method: 'DELETE',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(cancel),
      });

      return this.handleResponse<SubscriptionResponse>(response);
   }

   // Payment Methods
   async getPaymentMethods(): Promise<PaymentMethodsResponse> {
      const response = await fetch(`${API_BASE_URL}/methods`, {
         method: 'GET',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<PaymentMethodsResponse>(response);
   }

   async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
      const response = await fetch(`${API_BASE_URL}/methods/${paymentMethodId}`, {
         method: 'DELETE',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<{ success: boolean; message: string }>(response);
   }

   // Payment History
   async getPaymentHistory(query: PaymentHistoryQuery = {}): Promise<PaymentHistoryResponse> {
      const params = new URLSearchParams();

      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.status) params.append('status', query.status);
      if (query.paymentType) params.append('paymentType', query.paymentType);

      const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`, {
         method: 'GET',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<PaymentHistoryResponse>(response);
   }

   // Creator Payouts
   async setupPayoutAccount(setup: PayoutSetup): Promise<PayoutSetupResponse> {
      const response = await fetch(`${API_BASE_URL}/payouts/setup`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(setup),
      });

      return this.handleResponse<PayoutSetupResponse>(response);
   }

   async getPayoutAccountStatus(): Promise<PayoutAccountStatus> {
      const response = await fetch(`${API_BASE_URL}/payouts/account-status`, {
         method: 'GET',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<PayoutAccountStatus>(response);
   }

   async requestPayout(payout: PayoutRequest): Promise<PayoutRequestResponse> {
      const response = await fetch(`${API_BASE_URL}/payouts`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(payout),
      });

      return this.handleResponse<PayoutRequestResponse>(response);
   }

   async getPayoutHistory(query: PayoutHistoryQuery = {}): Promise<PayoutHistoryResponse> {
      const params = new URLSearchParams();

      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.status) params.append('status', query.status);

      const response = await fetch(`${API_BASE_URL}/payouts/history?${params.toString()}`, {
         method: 'GET',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<PayoutHistoryResponse>(response);
   }

   // Earnings & Analytics
   async getEarnings(): Promise<EarningsSummary> {
      const response = await fetch(`${API_BASE_URL}/earnings`, {
         method: 'GET',
         headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<EarningsSummary>(response);
   }

   // Admin Operations
   async refundPayment(refund: RefundRequest): Promise<RefundResponse> {
      const response = await fetch(`${API_BASE_URL}/refund`, {
         method: 'POST',
         headers: await this.getAuthHeaders(),
         body: JSON.stringify(refund),
      });

      return this.handleResponse<RefundResponse>(response);
   }

   // Utility Methods
   formatAmount(amount: number): string {
      return (amount / 100).toFixed(2);
   }

   parseAmount(amount: string): number {
      return Math.round(parseFloat(amount) * 100);
   }

   getCurrencySymbol(currency: string): string {
      const symbols: { [key: string]: string } = {
         usd: '$',
         eur: '€',
         gbp: '£',
         cad: 'C$',
         aud: 'A$',
      };
      return symbols[currency.toLowerCase()] || currency.toUpperCase();
   }
}

export const paymentAPI = new PaymentAPI();
export default paymentAPI;
