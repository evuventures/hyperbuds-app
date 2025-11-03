import { NotificationSettings } from '@/components/features/notifications/NotificationSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notification Settings | HyperBuds',
  description: 'Manage your notification preferences',
};

export default function NotificationSettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <NotificationSettings />
      </div>
    </div>
  );
}