import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Configs from "@/components/configpage";
const page = () => {
  return (
    <div>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">CONFIGS</h1>
            <p className="text-muted-foreground">Custom your all config</p>
          </div>
          <Configs></Configs>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default page;
