"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Configmodal() {
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
          <DialogTitle>คู่มือการใช้งาน CONFIGS</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>จะเป็นหน้าสำหรับให้ผู้ดูแลดูและแก้ไขการตั้งค่าของระบบทั้งหมด</p>
          <p>ไม่ว่าจะเป็นการเพิ่ม ลบ แผนก</p>
          <p>การจัดการแต้มการขึ้นระดับ Rank</p>
          <p>ตั้งค่าวันเพื่อรีเซ็ตแต้มของผู้ใช้ทั้งหมด</p>
          <p>ตั้งค่าแต้มที่ได้รับกับขยะในแต่ละประเถท</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
