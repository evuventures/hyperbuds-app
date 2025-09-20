// Payment Validation Utilities

export interface ValidationResult {
   isValid: boolean;
   errors: string[];
}

export interface CardValidationResult extends ValidationResult {
   brand?: string;
   formattedNumber?: string;
}

// Card Number Validation
export function validateCardNumber(cardNumber: string): CardValidationResult {
   const errors: string[] = [];

   // Remove spaces and non-digits
   const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');

   // Check if empty
   if (!cleaned) {
      errors.push('Card number is required');
      return { isValid: false, errors };
   }

   // Check length
   if (cleaned.length < 13 || cleaned.length > 19) {
      errors.push('Card number must be between 13 and 19 digits');
      return { isValid: false, errors };
   }

   // Luhn algorithm validation
   if (!luhnCheck(cleaned)) {
      errors.push('Invalid card number');
      return { isValid: false, errors };
   }

   const brand = getCardBrand(cleaned);
   const formattedNumber = formatCardNumber(cleaned);

   return {
      isValid: true,
      errors: [],
      brand,
      formattedNumber
   };
}

// Luhn Algorithm Implementation
function luhnCheck(cardNumber: string): boolean {
   let sum = 0;
   let isEven = false;

   // Process digits from right to left
   for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

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

// Get Card Brand
export function getCardBrand(cardNumber: string): string {
   const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');

   // Visa: starts with 4
   if (cleaned.startsWith('4')) return 'visa';

   // Mastercard: starts with 5 or 2
   if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';

   // American Express: starts with 3
   if (cleaned.startsWith('3')) return 'amex';

   // Discover: starts with 6
   if (cleaned.startsWith('6')) return 'discover';

   // Diners Club: starts with 3
   if (cleaned.startsWith('3')) return 'diners';

   // JCB: starts with 3
   if (cleaned.startsWith('3')) return 'jcb';

   // UnionPay: starts with 6
   if (cleaned.startsWith('6')) return 'unionpay';

   return 'unknown';
}

// Format Card Number
export function formatCardNumber(cardNumber: string): string {
   const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
   const groups = cleaned.match(/.{1,4}/g) || [];
   return groups.join(' ');
}

// Expiry Date Validation
export function validateExpiryDate(expiry: string): ValidationResult {
   const errors: string[] = [];

   // Check format (MM/YY)
   const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
   if (!regex.test(expiry)) {
      errors.push('Expiry date must be in MM/YY format');
      return { isValid: false, errors };
   }

   const [month, year] = expiry.split('/');
   const expMonth = parseInt(month);
   const expYear = parseInt('20' + year); // Convert YY to YYYY

   const currentDate = new Date();
   const currentYear = currentDate.getFullYear();
   const currentMonth = currentDate.getMonth() + 1;

   // Check if expired
   if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      errors.push('Card has expired');
      return { isValid: false, errors };
   }

   // Check if too far in future (10 years)
   if (expYear > currentYear + 10) {
      errors.push('Expiry date is too far in the future');
      return { isValid: false, errors };
   }

   return { isValid: true, errors: [] };
}

// CVV Validation
export function validateCVV(cvv: string, cardBrand?: string): ValidationResult {
   const errors: string[] = [];

   if (!cvv) {
      errors.push('CVV is required');
      return { isValid: false, errors };
   }

   // American Express uses 4 digits, others use 3
   const expectedLength = cardBrand === 'amex' ? 4 : 3;
   const regex = new RegExp(`^\\d{${expectedLength}}$`);

   if (!regex.test(cvv)) {
      errors.push(`CVV must be ${expectedLength} digits`);
      return { isValid: false, errors };
   }

   return { isValid: true, errors: [] };
}

// Email Validation
export function validateEmail(email: string): ValidationResult {
   const errors: string[] = [];

   if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
   }

   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
      return { isValid: false, errors };
   }

   return { isValid: true, errors: [] };
}

// Name Validation
export function validateName(name: string): ValidationResult {
   const errors: string[] = [];

   if (!name || name.trim().length === 0) {
      errors.push('Name is required');
      return { isValid: false, errors };
   }

   if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
      return { isValid: false, errors };
   }

   if (name.trim().length > 50) {
      errors.push('Name must be less than 50 characters');
      return { isValid: false, errors };
   }

   // Check for valid characters (letters, spaces, hyphens, apostrophes)
   const nameRegex = /^[a-zA-Z\s\-']+$/;
   if (!nameRegex.test(name)) {
      errors.push('Name contains invalid characters');
      return { isValid: false, errors };
   }

   return { isValid: true, errors: [] };
}

// Address Validation
export function validateAddress(address: {
   line1: string;
   city: string;
   state: string;
   postalCode: string;
   country: string;
}): ValidationResult {
   const errors: string[] = [];

   if (!address.line1 || address.line1.trim().length === 0) {
      errors.push('Street address is required');
   }

   if (!address.city || address.city.trim().length === 0) {
      errors.push('City is required');
   }

   if (!address.state || address.state.trim().length === 0) {
      errors.push('State/Province is required');
   }

   if (!address.postalCode || address.postalCode.trim().length === 0) {
      errors.push('Postal code is required');
   }

   if (!address.country || address.country.trim().length === 0) {
      errors.push('Country is required');
   }

   // Validate postal code format based on country
   if (address.postalCode && address.country) {
      const postalCodeError = validatePostalCode(address.postalCode, address.country);
      if (postalCodeError) {
         errors.push(postalCodeError);
      }
   }

   return {
      isValid: errors.length === 0,
      errors
   };
}

// Postal Code Validation by Country
function validatePostalCode(postalCode: string, country: string): string | null {
   const patterns: { [key: string]: RegExp } = {
      'US': /^\d{5}(-\d{4})?$/, // US ZIP code
      'CA': /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // Canadian postal code
      'GB': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // UK postal code
      'AU': /^\d{4}$/, // Australian postal code
      'DE': /^\d{5}$/, // German postal code
      'FR': /^\d{5}$/, // French postal code
      'ES': /^\d{5}$/, // Spanish postal code
      'IT': /^\d{5}$/, // Italian postal code
      'NL': /^\d{4} [A-Z]{2}$/, // Dutch postal code
      'SE': /^\d{3} \d{2}$/, // Swedish postal code
   };

   const pattern = patterns[country.toUpperCase()];
   if (pattern && !pattern.test(postalCode)) {
      return `Invalid postal code format for ${country}`;
   }

   return null;
}

// Amount Validation
export function validateAmount(amount: number, currency: string = 'usd'): ValidationResult {
   const errors: string[] = [];

   if (amount <= 0) {
      errors.push('Amount must be greater than 0');
   }

   if (amount > 99999999) { // $999,999.99
      errors.push('Amount is too large');
   }

   // Check for valid currency
   const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'];
   if (!validCurrencies.includes(currency.toLowerCase())) {
      errors.push('Invalid currency');
   }

   return {
      isValid: errors.length === 0,
      errors
   };
}

// Complete Payment Form Validation
export function validatePaymentForm(formData: {
   cardNumber: string;
   expiryDate: string;
   cvv: string;
   cardholderName: string;
   email: string;
   billingAddress: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
   };
}): ValidationResult {
   const errors: string[] = [];

   // Validate card number
   const cardValidation = validateCardNumber(formData.cardNumber);
   if (!cardValidation.isValid) {
      errors.push(...cardValidation.errors);
   }

   // Validate expiry date
   const expiryValidation = validateExpiryDate(formData.expiryDate);
   if (!expiryValidation.isValid) {
      errors.push(...expiryValidation.errors);
   }

   // Validate CVV
   const cvvValidation = validateCVV(formData.cvv, cardValidation.brand);
   if (!cvvValidation.isValid) {
      errors.push(...cvvValidation.errors);
   }

   // Validate name
   const nameValidation = validateName(formData.cardholderName);
   if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
   }

   // Validate email
   const emailValidation = validateEmail(formData.email);
   if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
   }

   // Validate address
   const addressValidation = validateAddress(formData.billingAddress);
   if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
   }

   return {
      isValid: errors.length === 0,
      errors
   };
}

// Format Currency
export function formatCurrency(amount: number, currency: string = 'usd'): string {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
   }).format(amount / 100);
}

// Parse Currency
export function parseCurrency(amount: string): number {
   const cleaned = amount.replace(/[^0-9.-]/g, '');
   return Math.round(parseFloat(cleaned) * 100);
}

// Get Currency Symbol
export function getCurrencySymbol(currency: string): string {
   const symbols: { [key: string]: string } = {
      usd: '$',
      eur: '€',
      gbp: '£',
      cad: 'C$',
      aud: 'A$',
      jpy: '¥',
   };
   return symbols[currency.toLowerCase()] || currency.toUpperCase();
}
