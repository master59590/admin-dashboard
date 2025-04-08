import { DashboardLayout } from "@/components/dashboard-layout"
import { UserStats } from "@/components/user-stats"
import { UserTable } from "@/components/user-table"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all users</p>
        </div>
        <UserStats />
        <UserTable />
      </div>
    </DashboardLayout>
  )
}
