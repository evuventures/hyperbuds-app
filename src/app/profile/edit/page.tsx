'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import React from "react";
import Card from "@/components/profile/ProfileEdit/Card"; 

export default function EditProfilePage() {
  

  return (
    <DashboardLayout>
      <div className="px-6 pt-0 pb-6">
        <Card/>
      </div>
    </DashboardLayout>
  );
}
