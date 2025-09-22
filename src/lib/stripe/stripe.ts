import { Stripe, StripeElements, StripeCardElement } from '@/types/payment.types';



class StripeService {
   private stripe: Stripe | null = null;
   private elements: StripeElements | null = null;
   private publishableKey: string;

   constructor() {
      this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
   }

   async initialize(): Promise<Stripe> {
      if (this.stripe) {
         return this.stripe;
      }

      if (typeof window === 'undefined') {
         throw new Error('Stripe can only be initialized on the client side');
      }

      if (!window.Stripe) {
         // Load Stripe.js dynamically
         const script = document.createElement('script');
         script.src = 'https://js.stripe.com/v3/';
         script.async = true;

         await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
         });
      }

      if (!window.Stripe) {
         throw new Error('Failed to load Stripe.js');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.stripe = (window.Stripe as any)(this.publishableKey);
      return this.stripe!;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   async createElements(options?: any): Promise<StripeElements> {
      const stripe = await this.initialize();
      this.elements = stripe.elements(options);
      return this.elements!;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   async createCardElement(options?: any): Promise<StripeCardElement> {
      const elements = await this.createElements();
      return elements.create('card', {
         style: {
            base: {
               fontSize: '16px',
               color: '#424770',
               '::placeholder': {
                  color: '#aab7c4',
               },
            },
            invalid: {
               color: '#9e2146',
            },
         },
         ...options,
      }) as StripeCardElement;
   }

   async confirmPayment(options: {
      elements: StripeElements;
      confirmParams: {
         payment_method: {
            card: StripeCardElement;
            billing_details?: {
               name?: string;
               email?: string;
               
               address?: Record<string, unknown>;
            };
         };
      };
      redirect: string;
      
   }): Promise<{ error?: unknown; paymentIntent?: unknown }> {
      const stripe = await this.initialize();
      return stripe.confirmPayment(options) as { error?: unknown; paymentIntent?: unknown};
   }

   
   async createPaymentMethod(cardElement: StripeCardElement, billingDetails?: any) {
      const stripe = await this.initialize();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (stripe as any).createPaymentMethod({
         type: 'card',
         card: cardElement,
         billing_details: billingDetails,
      });
   }

   async retrievePaymentIntent(clientSecret: string) {
      const stripe = await this.initialize();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (stripe as any).retrievePaymentIntent(clientSecret);
   }

   // Utility method to format card errors
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   formatCardError(error: any): string {
      if (error.type === 'card_error' || error.type === 'validation_error') {
         return error.message;
      } else {
         return 'An unexpected error occurred.';
      }
   }

   // Utility method to validate card details
   validateCardNumber(cardNumber: string): boolean {
      // Remove spaces and non-digits
      const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');

      // Check if empty
      if (!cleaned) {
         return false;
      }

      // Check if it's a valid length (13-19 digits)
      if (cleaned.length < 13 || cleaned.length > 19) {
         return false;
      }

      // For development, accept common test card numbers without Luhn validation
      const testCards = [
         '4242424242424242', // Visa test card
         '4000000000000002', // Visa test card (declined)
         '4000000000009995', // Visa test card (insufficient funds)
         '5555555555554444', // Mastercard test card
         '2223003122003222', // Mastercard test card
         '378282246310005',  // American Express test card
         '371449635398431',  // American Express test card
         '6011111111111117', // Discover test card
         '6011000990139424', // Discover test card
      ];

      if (testCards.includes(cleaned)) {
         return true;
      }

      // Luhn algorithm validation for other cards
      let sum = 0;
      let isEven = false;

      for (let i = cleaned.length - 1; i >= 0; i--) {
         let digit = parseInt(cleaned[i]);

         if (isEven) {
            digit *= 2;
            if (digit > 9) {
               digit -= 9;
            }
         }

         sum += digit;
         isEven = !isEven;
      }

      return sum % 10 === 0;
   }

   validateExpiryDate(expiry: string): boolean {
      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!regex.test(expiry)) {
         return false;
      }

      const [month, year] = expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      const expMonth = parseInt(month);
      const expYear = parseInt(year);

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
         return false;
      }

      return true;
   }

   validateCVV(cvv: string): boolean {
      const regex = /^\d{3,4}$/;
      return regex.test(cvv);
   }

   getCardBrand(cardNumber: string): string {
      const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');

      if (cleaned.startsWith('4')) return 'visa';
      if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
      if (cleaned.startsWith('3')) return 'amex';
      if (cleaned.startsWith('6')) return 'discover';

      return 'unknown';
   }

   formatCardNumber(cardNumber: string): string {
      const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
      const groups = cleaned.match(/.{1,4}/g) || [];
      return groups.join(' ');
   }

   // Apple Pay Integration
   async isApplePayAvailable(): Promise<boolean> {
      if (typeof window === 'undefined') return false;

      try {
         const stripe = await this.initialize();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const paymentRequest = (stripe as any).paymentRequest({
            country: 'US',
            currency: 'usd',
            total: {
               label: 'Test',
               amount: 100, // Use minimum amount for testing
            },
         });

         // Check if Apple Pay is available
         const canMakePayment = await paymentRequest.canMakePayment();
         return canMakePayment && canMakePayment.applePay === true;
      } catch (error) {
         console.warn('Apple Pay availability check failed:', error);
         return false;
      }
   }

   async createApplePayButton(options: {
      amount: number;
      currency: string;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (paymentMethod: any) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
   }): Promise<any> {
      try {
         const stripe = await this.initialize();

         // Check if Apple Pay is available first
         const isAvailable = await this.isApplePayAvailable();
         if (!isAvailable) {
            throw new Error('Apple Pay is not available on this device');
         }

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const paymentRequest = (stripe as any).paymentRequest({
            country: 'US',
            currency: options.currency,
            total: {
               label: options.label,
               amount: options.amount,
            },
            requestPayerName: true,
            requestPayerEmail: true,
         });

         const elements = stripe.elements();
         const prButton = elements.create('paymentRequestButton', {
            paymentRequest,
            style: {
               paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px',
               },
            },
         });

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         paymentRequest.on('paymentmethod', (event: any) => {
            options.onSuccess(event.paymentMethod);
            event.complete('success');
         });

         paymentRequest.on('cancel', () => {
            options.onError(new Error('Apple Pay was cancelled'));
         });

         return prButton;
      } catch (error) {
         console.error('Apple Pay setup failed:', error);
         options.onError(error);
         return null;
      }
   }
}

export const stripeService = new StripeService();
export default stripeService;
