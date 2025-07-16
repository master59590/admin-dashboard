"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Productmodal() {
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
          <DialogTitle>คู่มือการใช้งาน Products</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>
            จะเป็นหน้าสำหรับแสดงสินค้าที่ให้แลกได้ ซึ่งผู้ใช้จะแลกได้ตาม Rank
            ของตนเอง
          </p>
          <p>สามารถแก้ไข และลบสินค้าได้</p>
          <p>
            ซึ่งการแก้ไขจะสามารถ แก้ไข ชื่อ stock คำอธิบาย ราคา รูปภาพ
            ย้ายสินค้าไปเป็นสินค้าโปรโมชั่นและตั้งราคาใหม่ หรือย้ายกลับมาได้
            และสามารถเปลี่ยน rank ของสินค้าได้
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
