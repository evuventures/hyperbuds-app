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

const BASE_URL = 'https://api-hyperbuds-backend.onrender.com/api/v1/payments';

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

export const paymentAPI = new PaymentAPI();