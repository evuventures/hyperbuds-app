'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import Card from "@/components/profile/ProfileEdit/Card"; 

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  return (
    <DashboardLayout>
      <div className="px-6 pt-0 pb-6">
        <Card/>
      </div>
    </DashboardLayout>
  );
}
