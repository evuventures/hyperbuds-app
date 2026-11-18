'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import React from "react";
import Card from "@/components/profile/ProfileEdit/Card";

export default function EditProfilePage() {
  return (
    <DashboardLayout>
      <div className="min-h-full bg-slate-50 dark:bg-slate-950">
        <div className="px-4 pt-6 pb-20 md:px-6">
          <Card />
        </div>
      </div>
    </DashboardLayout>
  );
}
