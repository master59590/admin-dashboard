"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FullUserRank {
  user_id: string;
  name?: string;
  department_id?: string;
  point_total_for_year: number;
}

export default function RankPage() {
  const [year, setYear] = useState("2025");
  const [userRanks, setUserRanks] = useState<FullUserRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>(
    {}
  );
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const fetchRankData = async (selectedYear: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "user_point_total"),
        where("year", "==", parseInt(selectedYear))
      );
      const snap = await getDocs(q);

      const rawList = snap.docs.map((doc) => ({
        user_id: doc.data().user_id,
        point_total_for_year: doc.data().point_total_for_year,
      }));

      // ดึงชื่อและแผนกจาก user_id
      const enrichedList: FullUserRank[] = await Promise.all(
        rawList.map(async (item) => {
          const userDocRef = doc(db, "user_id", item.user_id);
          const userSnap = await getDoc(userDocRef);

          const userData = userSnap.exists() ? userSnap.data() : {};
          return {
            ...item,
            name: userData.name || "-",
            department_id: userData.department_id || "-",
          };
        })
      );

      // เรียงจากแต้มมากไปน้อย
      enrichedList.sort(
        (a, b) => b.point_total_for_year - a.point_total_for_year
      );
      setUserRanks(enrichedList);
    } catch (err) {
      console.error("Error fetching rank data:", err);
      setUserRanks([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartmentNames = async (userList: any[]) => {
    const deptIds = [...new Set(userList.map((user) => user.department_id))]; // เอาเฉพาะ ID ที่ไม่ซ้ำ
    const deptMap: Record<string, string> = {};

    await Promise.all(
      deptIds.map(async (deptId) => {
        const docRef = doc(db, "department_id", deptId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          deptMap[deptId] = data.job_title || "-";
        } else {
          deptMap[deptId] = "-";
        }
      })
    );

    setDepartmentMap(deptMap);
  };
  useEffect(() => {
    fetchRankData(year);
  }, [year]);
  useEffect(() => {
    if (userRanks.length > 0) {
      fetchDepartmentNames(userRanks);
    }
  }, [userRanks]);
  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>อันดับแต้มสะสมรายปี</CardTitle>
          <span className="text-sm">เลือกดูรายการย้อนหลังได้ 5 ปี</span>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm">เลือกปี:</span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
          ) : userRanks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              ไม่มีข้อมูลของปี {year}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>อันดับ</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead>แต้มสะสม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRanks.map((user, index) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      {user.department_id && departmentMap[user.department_id]
                        ? departmentMap[user.department_id]
                        : user.department_id}
                    </TableCell>

                    <TableCell>
                      {user.point_total_for_year.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
