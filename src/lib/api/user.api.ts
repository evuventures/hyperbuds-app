// src/lib/api/user.api.ts
import { BASE_URL } from '@/config/baseUrl';

export async function getCurrentUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!token) throw new Error('No access token found');

  const res = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return res.json();
}
