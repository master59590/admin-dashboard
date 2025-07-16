import { DashboardLayout } from "@/components/dashboard-layout";
import { ProductList } from "@/components/product-list";
import { Productmodal } from "@/components/Modal/productmodal";
export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">View all products</p>
          <div className="mt-4">
            <Productmodal />
          </div>
        </div>
        <ProductList />
      </div>
    </DashboardLayout>
  );
}
