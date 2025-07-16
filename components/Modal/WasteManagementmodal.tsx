"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Wastemanagemodal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          คู่มือการใช้งาน
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>คู่มือการใช้งาน Waste Management</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>
            จะเป็นหน้าสำหรับให้ผู้ดูแลในการดูและวิเคราห์ การทิ้งขยะขององกรค์
          </p>
          <p>
            สามารถดูแบบรายสัปดาห์ วัน เดือน หรือปีได้
            และวิเคราะห์อัตราการทิ้งขยะที่ถูกต้องขององกรค์
          </p>
          <p>
            สามารถดูข้อมูลการทิ้งขยะได้ เช่น วันที่ เวลา ชื่อผู้ทิ้งขยะ ชื่อแผนก
            ชื่อถังขยะ ชื่อขยะ และประเภทของขยะ ของแต่ละรายบุคคลได้
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
