"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Rankuser() {
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
          <DialogTitle>คู่มือการใช้งาน USER RANK</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>จะเป็นหน้าสำหรับให้ผู้ดูแลดูแต้มสะสมรายปี</p>
          <p>สามารถดูข้อมูลแต้มสะสมทั้งหมด ในแต่ละปี และย้อนหลังได้ 5 ปี</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
