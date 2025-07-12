import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Redemption from "@/components/redemptionslog";
const page = () => {
  return (
    <div>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">REDEMPTIONS</h1>
            <p className="text-muted-foreground">Show log redemptions</p>
          </div>
          <Redemption></Redemption>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default page;
