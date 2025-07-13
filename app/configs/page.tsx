import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Configs from "@/components/configpage";
const page = () => {
  return (
    <div>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">CONFIGS</h1>
            <p className="text-muted-foreground mb-2">Custom your all config</p>

            <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm">
              <li>จัดการ Department</li>
              <li>จัดการ Rank</li>
              <li>รีเซ็ตแต้มผู้ใช้</li>
              <li>แต้มที่ได้รับสูงสุดต่อวัน</li>
              <li>แต้มขยะตามประเภท</li>
            </ul>
          </div>
          <Configs></Configs>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default page;
