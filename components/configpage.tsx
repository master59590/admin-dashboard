"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Department {
  id: string;
  job_title: string;
}
interface Rank {
  id: string;
  name: string;
  point_total: number;
  position: number;
}
interface ResetDate {
  day: number;
  month: number;
}
interface WasteItem {
  id: string;
  waste_name: string;
  waste_type: string;
  point: number;
}
export default function ConfigPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);

  const [newDept, setNewDept] = useState("");
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [newRank, setNewRank] = useState({
    name: "",
    point_total: 0,
    position: 0,
  });
  const [resetDate, setResetDate] = useState<ResetDate>({ day: 1, month: 1 });
  const [isDue, setIsDue] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [wasteMax, setWasteMax] = useState(0);
  const [defaultWaste, setDefaultWaste] = useState(0);
  const [wasteDescription, setWasteDescription] = useState("");

  const fetchDepartments = async () => {
    const snap = await getDocs(collection(db, "department_id"));
    const list: Department[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      job_title: docSnap.data().job_title,
    }));
    setDepartments(list);
  };

  const addDepartment = async () => {
    if (!newDept.trim()) return;
    const maxId = departments
      .map((d) => parseInt(d.id))
      .reduce((a, b) => Math.max(a, b), 10000000);
    const newId = String(maxId + 1).padStart(8, "0");
    await setDoc(doc(db, "department_id", newId), {
      job_title: newDept.trim(),
    });
    setNewDept("");
    fetchDepartments();
  };

  const updateDepartment = async (id: string, newTitle: string) => {
    const ref = doc(db, "department_id", id);
    await updateDoc(ref, { job_title: newTitle });
    fetchDepartments();
  };

  const deleteDepartment = async (id: string) => {
    const ref = doc(db, "department_id", id);
    await deleteDoc(ref);
    fetchDepartments();
  };

  const fetchRanks = async () => {
    const snap = await getDocs(collection(db, "Rank"));
    const list: Rank[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name,
      point_total: docSnap.data().point_total,
      position: docSnap.data().position,
    }));
    list.sort((a, b) => a.position - b.position);
    setRanks(list);
  };

  const updateRank = async (id: string, updated: Rank) => {
    await updateDoc(doc(db, "Rank", id), {
      name: updated.name,
      point_total: updated.point_total,
    });
    fetchRanks();
  };

  const fetchResetSchedule = async () => {
    const snap = await getDoc(
      doc(db, "reset_point_for_year", "CEkoKhdg6wh9CohjWKGF")
    );
    if (snap.exists()) {
      const data = snap.data() as ResetDate;

      const now = new Date();
      const match =
        now.getDate() === data.day && now.getMonth() + 1 === data.month;

      // 🪵 Debug log
      console.log("📅 วันนี้:", now.getDate(), now.getMonth() + 1);
      console.log("📅 ตั้งไว้:", data.day, data.month);
      console.log("✅ ตรงกันไหม:", match);

      setIsDue(match);
      if (match) {
        console.log("🎉 ตรง! setShowAlert(true)");
        setShowAlert(true);
      }
      setResetDate(data); // ย้ายมาไว้หลังสุด
    }
  };

  const handleResetPoints = async () => {
    const userSnap = await getDocs(collection(db, "user_id"));
    const batchUpdates = userSnap.docs.map((docSnap) =>
      updateDoc(doc(db, "user_id", docSnap.id), { user_point: 0 })
    );
    await Promise.all(batchUpdates);
    alert("รีเซ็ตแต้มผู้ใช้ทั้งหมดแล้ว");
  };

  const fetchWasteRule = async () => {
    const snap = await getDoc(doc(db, "rule_waste_management", "R0001"));
    if (snap.exists()) {
      const data = snap.data();
      setWasteMax(data.max || 0);
      setDefaultWaste(data.default || 0);
      setWasteDescription(data.description || "");
    }
  };

  const fetchWasteItems = async () => {
    const snap = await getDocs(collection(db, "waste_type"));
    const list: WasteItem[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      waste_name: docSnap.data().waste_name,
      waste_type: docSnap.data().waste_type,
      point: docSnap.data().point,
    }));
    setWasteItems(list);
  };

  useEffect(() => {
    fetchDepartments();
    fetchRanks();
    fetchResetSchedule();
    fetchWasteRule();
    fetchWasteItems();
  }, []);

  return (
    <div className="w-full max-w-3xl p-6 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>จัดการ Department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <Separator />
          {departments.map((dept, index) => (
            <div key={dept.id} className="flex gap-2 items-center">
              <Input
                value={dept.job_title}
                onChange={(e) => {
                  const updated = [...departments];
                  updated[index].job_title = e.target.value;
                  setDepartments(updated);
                }}
              />
              <Button
                variant="outline"
                onClick={() =>
                  updateDepartment(dept.id, departments[index].job_title)
                }
              >
                บันทึก
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDepartment(dept.id)}
              >
                ลบ
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>จัดการ Rank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <Separator />
          {ranks.map((r, i) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-2 md:gap-4"
            >
              <Input
                className="flex-1 min-w-[160px]"
                value={r.name}
                onChange={(e) => {
                  const updated = [...ranks];
                  updated[i].name = e.target.value;
                  setRanks(updated);
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  แต้มขั้นต่ำเพื่อรับ Rank:
                </span>
                <Input
                  type="number"
                  className="w-[120px]"
                  value={r.point_total}
                  onChange={(e) => {
                    const updated = [...ranks];
                    updated[i].point_total = parseInt(e.target.value || "0");
                    setRanks(updated);
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => updateRank(r.id, r)}>
                บันทึก
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>รีเซ็ตแต้มผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex items-center gap-4">
            <span>ตั้งค่ารีเซ็ตแต้ม </span>
            <span>วันที่ : </span>
            <Input
              type="number"
              className="w-[80px]"
              value={resetDate?.day ?? ""}
              onChange={(e) =>
                setResetDate((prev) => ({
                  ...prev,
                  day: parseInt(e.target.value || "1"),
                }))
              }
              placeholder="วัน"
              min={1}
              max={31}
            />
            <span>เดือน : </span>
            <Input
              type="number"
              className="w-[80px]"
              value={resetDate?.month ?? ""}
              onChange={(e) =>
                setResetDate((prev) => ({
                  ...prev,
                  month: parseInt(e.target.value || "1"),
                }))
              }
              placeholder="เดือน"
              min={1}
              max={12}
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!resetDate) return;

                await setDoc(
                  doc(db, "reset_point_for_year", "CEkoKhdg6wh9CohjWKGF"),
                  resetDate
                );

                alert("บันทึกวันที่รีเซ็ตแล้ว");

                // 🔁 เพิ่มบรรทัดนี้เพื่อดึงวันล่าสุดและเช็ค isDue ใหม่
                await fetchResetSchedule();
              }}
            >
              บันทึกวันรีเซ็ต
            </Button>
          </div>

          <Button
            disabled={!isDue}
            onClick={handleResetPoints}
            className="border border-red-500 text-red-500 bg-transparent hover:bg-red-100"
          >
            รีเซ็ตแต้มผู้ใช้ทั้งหมด
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>แต้มที่ได้รับสูงสุดต่อวัน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex items-center gap-4">
            <span>กำหนด max:</span>
            <Input
              type="number"
              className="w-[100px]"
              value={wasteMax}
              onChange={(e) => setWasteMax(parseInt(e.target.value || "0"))}
            />
            <Button
              variant="outline"
              onClick={async () => {
                await updateDoc(doc(db, "rule_waste_management", "R0001"), {
                  max: wasteMax,
                });
                alert("บันทึก max ใหม่แล้ว");
              }}
            >
              บันทึก
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setWasteMax(defaultWaste);
              }}
            >
              กลับเป็นค่า default
            </Button>
          </div>
          <p className="text-sm text-muted-foreground border border-border rounded-md p-4 leading-relaxed whitespace-pre-line">
            {wasteDescription || "❗ ไม่มีคำอธิบาย"}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>แต้มขยะตามประเภท</CardTitle>
          <span>แต้ม default ?</span>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          {wasteItems.map((item, i) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-2 md:gap-4"
            >
              <Input
                value={item.waste_name}
                readOnly
                className="w-[160px] bg-transparent border-none focus-visible:ring-0 focus:outline-none text-muted-foreground cursor-default"
              />

              <Input
                className="w-[160px] bg-transparent border-none focus-visible:ring-0 focus:outline-none text-muted-foreground cursor-default"
                value={item.waste_type}
                readOnly
              />

              <Input
                type="number"
                className="w-[100px]"
                value={item.point}
                onChange={(e) => {
                  const updated = [...wasteItems];
                  updated[i].point = parseInt(e.target.value || "0");
                  setWasteItems(updated);
                }}
              />
              <Button
                variant="outline"
                onClick={async () => {
                  await updateDoc(doc(db, "waste_type", item.id), {
                    waste_name: item.waste_name,
                    waste_type: item.waste_type,
                    point: item.point,
                  });
                  alert("อัปเดตเรียบร้อยแล้ว");
                }}
              >
                บันทึก
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>วันนี้คือวันที่รีเซ็ตแต้ม</AlertDialogTitle>
            <p>กรุณากดปุ่ม “รีเซ็ตแต้มผู้ใช้ทั้งหมด” เพื่อเริ่มต้นรอบใหม่</p>
          </AlertDialogHeader>

          {/* ✅ เพิ่ม Footer และปุ่มกด */}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAlert(false); // ปิด Alert
              }}
            >
              ปิด
            </Button>
            <Button
              className="border border-red-500 text-red-500 bg-transparent hover:bg-red-100"
              onClick={async () => {
                await handleResetPoints(); // รีเซ็ตแต้ม
                setShowAlert(false); // ปิด Alert หลังทำเสร็จ
              }}
            >
              รีเซ็ตแต้ม
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
