import React from 'react'
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { MainContent } from "@/app/dashboard/page";
const page = () => {
  return (
    <div >
      <DashboardLayout>
        <MainContent />
      </DashboardLayout>
    </div>
  )
}

export default page