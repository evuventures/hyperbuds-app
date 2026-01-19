import React from 'react'
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { MessagesContent } from "./components/MessagesContent";

const page = () => {
   return (
      <DashboardLayout>
         <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <MessagesContent />
            </div>
         </div>
      </DashboardLayout>
   )
}

export default page
