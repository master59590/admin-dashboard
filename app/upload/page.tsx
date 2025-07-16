import { DashboardLayout } from "@/components/dashboard-layout";
import { UploadForm } from "@/components/upload-form";
import { Uploadmodal } from "@/components/Modal/Uploadmodal";
export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Product</h1>
          <p className="text-muted-foreground">Add a new product</p>
          <div className="mt-4">
            <Uploadmodal />
          </div>
        </div>
        <UploadForm />
      </div>
    </DashboardLayout>
  );
}
