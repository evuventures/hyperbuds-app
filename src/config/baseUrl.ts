/**
 * Backend API Base URL Configuration
 * 
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL (if set)
 * 2. NEXT_PUBLIC_API_BASE_URL without /api/v1 (if set)
 * 3. Fallback to default backend URL
 */
export const BASE_URL =
   process.env.NEXT_PUBLIC_BASE_URL ||
   (process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')) ||
   'https://api-hyperbuds-backend.onrender.com';