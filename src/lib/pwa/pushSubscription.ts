import apiClient from '@/lib/api/client';
import { getAccessToken } from '@/store/authSelectors';

export type BrowserPushState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function isWebPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    window.isSecureContext
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) {
    return navigator.serviceWorker.ready;
  }
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  return navigator.serviceWorker.ready;
}

export async function getBrowserPushState(): Promise<BrowserPushState> {
  if (!isWebPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    if (!reg) return 'unsubscribed';
    const sub = await reg.pushManager.getSubscription();
    return sub ? 'subscribed' : 'unsubscribed';
  } catch {
    return 'unsubscribed';
  }
}

export async function subscribeToWebPush(): Promise<{ subscribed: boolean }> {
  if (!isWebPushSupported()) {
    throw new Error('Push notifications are not supported in this browser or context.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const keyRes = await apiClient.get<{ enabled?: boolean; publicKey?: string | null }>(
    '/notifications/push/vapid-public-key',
  );
  const publicKey = keyRes.data?.publicKey;
  if (!publicKey) {
    throw new Error('Push notifications are not configured on the server yet.');
  }

  const registration = await ensureServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Browser returned an incomplete push subscription.');
  }

  await apiClient.post('/notifications/push/subscribe', {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  });

  return { subscribed: true };
}

export async function unsubscribeFromWebPush(): Promise<{ subscribed: boolean }> {
  let endpoint: string | undefined;
  if (isWebPushSupported()) {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        endpoint = sub.endpoint;
        await sub.unsubscribe();
      }
    } catch {
      // Continue server cleanup
    }
  }

  await apiClient.delete('/notifications/push/subscribe', {
    data: endpoint ? { endpoint } : {},
  });

  return { subscribed: false };
}

/**
 * Silently re-syncs an already-granted browser push subscription with the backend
 * when an authenticated user loads the app.
 */
export async function syncExistingPushSubscription(): Promise<void> {
  if (!isWebPushSupported() || Notification.permission !== 'granted') return;
  const token =
    getAccessToken() ||
    (typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null);
  if (!token) return;

  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
    await apiClient.post('/notifications/push/subscribe', {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
    });
  } catch {
    // Best-effort silent sync
  }
}

export async function sendTestWebPush(): Promise<void> {
  await apiClient.post('/notifications/push/test');
}
