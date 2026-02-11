// src/components/features/notifications/NotificationSettings.tsx

'use client';

import React from 'react';
import { Bell, Mail, Smartphone, Monitor, Save, Loader2 } from 'lucide-react';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/features/useNotifications';
import { useToast } from '@/hooks/ui/useToast';
import type { NotificationPreferences } from '@/types/notifications.types';

export const NotificationSettings: React.FC = () => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const { toast } = useToast();

  const [localPreferences, setLocalPreferences] = React.useState<NotificationPreferences | null>(null);

  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (
    category: 'email' | 'push' | 'inApp',
    type: keyof NotificationPreferences['email']
  ) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      [category]: {
        ...localPreferences[category],
        [type]: !localPreferences[category][type],
      },
    });
  };

  const handleSave = () => {
    if (!localPreferences || !preferences) return;

    const updates: Partial<NotificationPreferences> = {};
    
    // Only send changed preferences
    if (JSON.stringify(localPreferences.email) !== JSON.stringify(preferences.email)) {
      updates.email = localPreferences.email;
    }
    if (JSON.stringify(localPreferences.push) !== JSON.stringify(preferences.push)) {
      updates.push = localPreferences.push;
    }
    if (JSON.stringify(localPreferences.inApp) !== JSON.stringify(preferences.inApp)) {
      updates.inApp = localPreferences.inApp;
    }

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates);
    } else {
      toast({
        title: 'No changes to save',
        duration: 2000,
      });
    }
  };

  if (isLoading || !localPreferences) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const notificationTypes: Array<{ key: keyof NotificationPreferences['email']; label: string }> = [
    { key: 'match', label: 'Matches' },
    { key: 'message', label: 'Messages' },
    { key: 'collaboration', label: 'Collaborations' },
    { key: 'marketplace', label: 'Marketplace' },
    { key: 'payment', label: 'Payments' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Notification Preferences
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose how you want to receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <section className="p-6 bg-gray-50 rounded-xl border border-gray-300 dark:bg-gray-900/50 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Email Notifications</h2>
          </div>
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <label
                key={type.key}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={localPreferences.email[type.key]}
                  onChange={() => handleToggle('email', type.key)}
                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-purple-400"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Push Notifications */}
        <section className="p-6 bg-gray-50 rounded-xl border border-gray-300 dark:bg-gray-900/50 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Push Notifications</h2>
          </div>
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <label
                key={type.key}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={localPreferences.push[type.key]}
                  onChange={() => handleToggle('push', type.key)}
                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-purple-400"
                />
              </label>
            ))}
          </div>
        </section>

        {/* In-App Notifications */}
        <section className="p-6 bg-gray-50 rounded-xl border border-gray-300 dark:bg-gray-900/50 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">In-App Notifications</h2>
          </div>
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <label
                key={type.key}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={localPreferences.inApp[type.key]}
                  onChange={() => handleToggle('inApp', type.key)}
                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-purple-400"
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;

