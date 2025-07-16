"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Redempmodal() {
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
          <DialogTitle>คู่มือการใช้งาน REDEMPTIONS</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>จะเป็นหน้าสำหรับให้ผู้ดูแล</p>
          <p>
            ใช้เพื่อการดูว่ามีผู้ใช่คนใดแลกของอะไรบ้าง
            และกดปุ่มสีเหลืองเพื่อยืนยันการแลกเมื่อแลกของเสร็จสิ้น
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
