import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Userrank from "@/components/userrank";
import { Rankuser } from "@/components/Modal/Rankusermodal";
const page = () => {
  return (
    <div>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">USER RANK</h1>
            <p className="text-muted-foreground">Show user rank for year</p>
            <div className="mt-4">
              <Rankuser />
            </div>
          </div>
          <Userrank></Userrank>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default page;
