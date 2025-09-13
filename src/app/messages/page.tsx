import React from 'react'
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { MessagesContent } from "./MessagesContent";

const page = () => {
   return (
      <div>
         <DashboardLayout>
            <MessagesContent />
         </DashboardLayout>
      </div>
   )
}

export default page
