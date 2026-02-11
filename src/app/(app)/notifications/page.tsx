'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { NotificationCenter } from '@/components/features/notifications/NotificationCenter';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl">
            {/* Header with Back Button */}
            <div className="flex gap-2 justify-between items-center mb-6 sm:mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="text-xs text-gray-900 bg-gray-100 border-gray-300 cursor-pointer sm:text-sm dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <ArrowLeft className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>

            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </div>
    </div>
  );
}
