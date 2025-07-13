"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ถ้ายังไม่ได้ import ให้ใส่บรรทัดนี้

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

interface PointLog {
  id: string;
  user_id: string;
  point: number;
  transaction_type: string;
  created_at: Date;
}

interface UserLog {
  id: string;
  user_id: string;
  admin_id: string;
  description: string;
  action: string;
  timestamp: Date;
}

interface RewardLog {
  id: string;
  reward_id: string;
  admin_id: string;
  description: string;
  create_at: Date;
  update_at: Date;
}

export default function AllLogsPage() {
  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [rewardLogs, setRewardLogs] = useState<RewardLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const fetchPointLogs = async () => {
    const snap = await getDocs(collection(db, "Points_History_Table"));
    const list: PointLog[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        point: data.point,
        transaction_type: data.transaction_type,
        created_at: (data.created_at as Timestamp)?.toDate(),
      };
    });

    // เรียงจาก created_at ใหม่ → เก่า
    list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    setPointLogs(list);
  };

  const fetchUserLogs = async () => {
    const snap = await getDocs(collection(db, "User_management"));
    const list: UserLog[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        admin_id: data.admin_id,
        description: data.description,
        action: data.action,
        timestamp: (data.timestamp as Timestamp)?.toDate(),
      };
    });
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setUserLogs(list);
  };

  const fetchRewardLogs = async () => {
    const snap = await getDocs(collection(db, "Reward_Logs"));
    const list: RewardLog[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        reward_id: data.reward_id,
        admin_id: data.admin_id,
        description: data.description,
        create_at: (data.create_at as Timestamp)?.toDate(),
        update_at: (data.update_at as Timestamp)?.toDate(),
      };
    });
    list.sort((a, b) => b.create_at.getTime() - a.create_at.getTime());

    setRewardLogs(list);
  };

  useEffect(() => {
    fetchPointLogs();
    fetchUserLogs();
    fetchRewardLogs();
  }, []);

  const formatDate = (date?: Date) =>
    date?.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const filteredUserLogs = userLogs.filter(
    (log) => actionFilter === "all" || log.action === actionFilter
  );

  const [pointPage, setPointPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [rewardPage, setRewardPage] = useState(1);
  const itemsPerPage = 10;

  const pointStart = (pointPage - 1) * itemsPerPage;

  const userStart = (userPage - 1) * itemsPerPage;
  const pagedUserLogs = filteredUserLogs.slice(
    userStart,
    userStart + itemsPerPage
  );

  const totalUserPages = Math.ceil(filteredUserLogs.length / itemsPerPage);

  const rewardStart = (rewardPage - 1) * itemsPerPage;
  const pagedRewardLogs = rewardLogs.slice(
    rewardStart,
    rewardStart + itemsPerPage
  );
  const totalRewardPages = Math.ceil(rewardLogs.length / itemsPerPage);
  const filteredPointLogs = pointLogs.filter((log) =>
    log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pagedPointLogs = filteredPointLogs.slice(
    pointStart,
    pointStart + itemsPerPage
  );

  const totalPointPages = Math.ceil(filteredPointLogs.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* 🔵 Points Log */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการใช้แต้ม (Points Log)</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="search" className="text-sm font-medium">
              ค้นหา User ID :
            </label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPointPage(1); // reset หน้าเมื่อค้นหาใหม่
              }}
              placeholder="เช่น 651310024"
              className="w-64"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Point</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedPointLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell>{log.point}</TableCell>
                  <TableCell>{log.transaction_type}</TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4">
            <p className="text-sm text-muted-foreground">Page {pointPage}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPointPage((prev) => Math.max(prev - 1, 1))}
                disabled={pointPage === 1}
              >
                &larr; Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPointPage((prev) => Math.min(prev + 1, totalPointPages))
                }
                disabled={pointPage === totalPointPages}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🟢 User Management Log */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการจัดการผู้ใช้ (User Management Log)</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm font-medium">Action :</label>
            <Select
              value={actionFilter}
              onValueChange={(val) => {
                setActionFilter(val);
                setUserPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือก action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Admin ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead>แก้ไขล่าสุด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedUserLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell>{log.admin_id}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4">
            <p className="text-sm text-muted-foreground">Page {userPage}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                disabled={userPage === 1}
              >
                &larr; Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setUserPage((prev) => Math.min(prev + 1, totalUserPages))
                }
                disabled={userPage === totalUserPages}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🟡 Reward Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            ประวัติการจัดการของรางวัล (Reward Management Log)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward ID</TableHead>
                <TableHead>Admin ID</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead>แก้ไขล่าสุด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRewardLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.reward_id}</TableCell>
                  <TableCell>{log.admin_id}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{formatDate(log.create_at)}</TableCell>
                  <TableCell>{formatDate(log.update_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4">
            <p className="text-sm text-muted-foreground">Page {rewardPage}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRewardPage((prev) => Math.max(prev - 1, 1))}
                disabled={rewardPage === 1}
              >
                &larr; Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setRewardPage((prev) => Math.min(prev + 1, totalRewardPages))
                }
                disabled={rewardPage === totalRewardPages}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
