import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Alllogs from "@/components/alllogs";
const page = () => {
  return (
    <div>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">All Logs</h1>
            <p className="text-muted-foreground mb-2">Show All Log</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm">
              <li>ประวัติการใช้แต้ม</li>
              <li>ประวัติการจัดการผู้ใช้</li>
              <li>ประวัติการจัดการของรางวัล</li>
            </ul>
          </div>
          <Alllogs></Alllogs>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default page;
