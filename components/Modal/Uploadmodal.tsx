"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Uploadmodal() {
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
          <DialogTitle>คู่มือการใช้งาน Upload Product</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>จะเป็นหน้าสำหรับ ผู้ดููแลระบบในการอัพโหลดสินค้าใหม่</p>
          <p>โดยการ ใส่ชื่อ ราคา จำนวนสินค้า rank คำอธิบาย และรูปภาพ</p>
          <p>ไม่กำหนดขนานของรูปภาพ</p>
          <p></p>
          <p>การกำหนดราคาของนั้น จากค่ามาตรฐานของแอพ 10 แต้ม = 1 บาท</p>
          <p>
            ดังนั้น หากต้องการให้สินค้า 100 บาท ก็จะต้องใส่ราคาเป็น 1000
            เพื่อให้ได้ 100 แต้ม
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
