"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Systemmodal() {
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
          <DialogTitle>คู่มือการใช้งาน SYSTEM</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>
            จะเป็นหน้าสำหรับให้ผู้ดูแล ดู status ของถังขยะหาก
            ว่าถังขยะทำงานหรือไม่
          </p>
          <p>และให้ผู้ดูแล ติดต่อพนักงาน Eco เพื่อทำการแก้ไขระบบ</p>
          <p>
            ผู้ดูแลไม่จำเป้นต้องดูหรือแก้ไขอะไรอย่างอื่นในหน้านี้นอกจาก status
          </p>
          <p>กรุณาติดต่อพนักงาน Ecos หรือติดต่อที่อีเมล เพื่อติดต่อแก้ปัญหา </p>
          <p>Ecocyclesolution@gmail.com</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
