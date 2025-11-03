// src/app/notifications/page.tsx

import { Metadata } from 'next';
import { NotificationCenter } from '@/components/features/notifications/NotificationCenter';

export const metadata: Metadata = {
  title: 'Notifications | HyperBuds',
  description: 'View and manage your notifications',
};

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <NotificationCenter />
      </div>
    </div>
  );
}

