"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Usermodal() {
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
          <DialogTitle>คู่มือการใช้งาน User Management</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>จะเป็นหน้าสำหรับให้ผู้ดูแลใช้จัดการกับผู้ใช้</p>
          <p>สามารถดูข้อมูลผู้ใช้ได้ เช่น ไอดี ชื่อ อีเมลล์ แต้ม และแผนก</p>
          <p>
            สามารถแก้ไขข้อมูลผู้ใช้ได้ เช่น ชื่อ อีเมลล์ แต้ม และแผนก
            และสามารถลบผู้ใช้ได้
          </p>
          <p>
            โดยการกดปุ่ม 3 จุดที่อยู่ข้างหลังชื่อผู้ใช้ตรง แถว action แล้วจะขึ้น
            ปุ่มให้ดูข้อมูลผู้ใช้ แก้ไขข้อมูลผู้ใช้ และ ลบผู้ใช้
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
