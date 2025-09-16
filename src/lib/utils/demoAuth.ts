// Demo authentication utility for testing
export function setDemoToken() {
   if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', 'demo-token-12345');
      console.log('Demo token set! Refresh the page to see the messages.');
   }
}

export function clearDemoToken() {
   if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      console.log('Demo token cleared!');
   }
}

export function hasDemoToken(): boolean {
   if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') === 'demo-token-12345';
   }
   return false;
}
