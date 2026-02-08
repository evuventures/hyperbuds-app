'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import React from "react";
import Card from "@/components/profile/ProfileEdit/Card";

export default function EditProfilePage() {
  return (
    <DashboardLayout>
      <div className="relative min-h-full bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-900/10">
        {/* Floating background blur elements */}
        <div className="overflow-hidden fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-purple-300/30 dark:bg-purple-500/20" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-blue-300/30 dark:bg-blue-500/20" />
          <div className="absolute top-1/2 left-1/2 w-125 h-125 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 px-4 pt-6 pb-16 md:px-6 lg:pb-34">
          <Card />
        </div>
      </div>
    </DashboardLayout>
  );
}
