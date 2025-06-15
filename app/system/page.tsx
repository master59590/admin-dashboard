import React from 'react'
import { DashboardLayout } from "@/components/dashboard-layout"
import System from '@/components/system'
import { SystemTable } from '@/components/system-table'
const page = () => {
  return (
    <div>
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">SYSTEM</h1>
                    <p className="text-muted-foreground">Setting sensor system</p>
                </div>
                <System></System>
                <SystemTable></SystemTable>
            </div>
        </DashboardLayout>
    </div>
  )
}

export default page