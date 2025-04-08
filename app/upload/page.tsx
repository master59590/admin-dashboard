import { DashboardLayout } from "@/components/dashboard-layout"
import { UploadForm } from "@/components/upload-form"

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Product</h1>
          <p className="text-muted-foreground">Add a new product to your Firebase database</p>
        </div>
        <UploadForm />
      </div>
    </DashboardLayout>
  )
}
