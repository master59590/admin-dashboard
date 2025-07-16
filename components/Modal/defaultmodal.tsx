"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Defaultmodal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          แต้ม default ?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แต้ม default ?</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-6 space-y-4">
          <p>การให้แต้มจากการทิ้งขยะควรคำนึงถึง ราคาขยะของขยะชิ้นนั้น ๆ</p>
          <p>เช่น ขวดพลาสติกใส PET 1 ชิ้น ขยะ 1 บาท</p>
          <p>1 บาท = 10 แต้ม</p>
          <p>จึงได้ขวดพลาสติกใส PET 10 แต้มต่อการทิ้ง 1 ครั้ง</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
