import { DashboardLayout } from "@/components/dashboard-layout"
import { WasteSummary } from "@/components/waste-summary"
import { WasteLogs } from "@/components/waste-logs"

export default function WastePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Waste Management</h1>
          <p className="text-muted-foreground">Monitor and analyze waste disposal data</p>
        </div>
        <WasteSummary />
        <WasteLogs />
      </div>
    </DashboardLayout>
  )
}
