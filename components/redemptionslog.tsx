"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { RefreshCw } from "lucide-react";
import { RewardCombobox } from "@/components/ui/RewardCombobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Redemption {
  id: string;
  coupon: string;
  user_id: string;
  reward_id: string;
  reward_name?: string;
  points_used: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export default function Redemption() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRewardName, setFilterRewardName] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    status: string;
  } | null>(null);

  const fetchRedemptions = async () => {
    setLoading(true);
    const q = query(
      collection(db, "Redemptions"),
      orderBy("created_at", "desc")
    );
    const snap = await getDocs(q);

    const list: Redemption[] = await Promise.all(
      snap.docs.map(async (docSnap): Promise<Redemption> => {
        const data = docSnap.data();
        const rewardId = data.reward_id;
        let rewardName = "";

        try {
          const rewardDoc = await getDoc(doc(db, "products", rewardId));
          rewardName = rewardDoc.exists()
            ? rewardDoc.data().name
            : "(ไม่พบชื่อ)";
        } catch (err) {
          rewardName = "(โหลดชื่อไม่ได้)";
        }

        return {
          id: docSnap.id,
          coupon: data.coupon ?? "",
          user_id: data.user_id ?? "",
          reward_id: rewardId,
          reward_name: rewardName,
          points_used: data.points_used ?? 0,
          status: data.status ?? "",
          created_at: data.created_at?.toDate?.() ?? new Date(),
          updated_at: data.updated_at?.toDate?.() ?? new Date(),
        };
      })
    );

    setRedemptions(list);
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (currentStatus === "accept" || currentStatus === "cancel") return; // ✅ ห้ามกดถ้าเป็น accept แล้ว

    const newStatus = currentStatus === "packing" ? "accept" : "packing";
    const ref = doc(db, "Redemptions", id);
    await updateDoc(ref, { status: newStatus, updated_at: new Date() });
    fetchRedemptions();
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = redemptions.filter((r) => {
    const matchSearch = r.user_id.includes(search);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchReward =
      filterRewardName === "all" || r.reward_name === filterRewardName;

    return matchSearch && matchStatus && matchReward;
  });

  const rewardNameOptions = Array.from(
    new Set(redemptions.map((r) => r.reward_name ?? ""))
  )
    .filter((name) => name !== "")
    .sort((a, b) => a.localeCompare(b));

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);
  const currentPageData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="p-6">
      <div className="flex mb-4 gap-2 items-center">
        <Input
          placeholder="Search by user_id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
        <RewardCombobox
          value={filterRewardName}
          onChange={setFilterRewardName}
          options={["all", ...rewardNameOptions]}
        />

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="packing">Packing</SelectItem>
            <SelectItem value="accept">Accepted</SelectItem>
            <SelectItem value="cancel">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setFilterStatus("all");
            setFilterRewardName("all");
          }}
          className="flex gap-2 items-center"
        >
          <RefreshCw className="w-4 h-4" />
          รีเซ็ตตัวกรอง
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coupon</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Reward ID</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points Used</TableHead>
                {/* <TableHead>Status</TableHead> */}
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.coupon}</TableCell>
                  <TableCell>{r.user_id}</TableCell>
                  <TableCell>{r.reward_id}</TableCell>
                  <TableCell>{r.reward_name}</TableCell>
                  <TableCell>{r.points_used}</TableCell>
                  {/* <TableCell>
                    <span className="capitalize font-medium">{r.status}</span>
                  </TableCell> */}
                  <TableCell>
                    {format(r.created_at, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem({ id: r.id, status: r.status });
                        setConfirmOpen(true);
                      }}
                      variant="outline"
                      disabled={["accept", "cancel"].includes(r.status)}
                      className={`border font-medium
    ${
      r.status === "accept"
        ? "border-green-500 text-green-600"
        : r.status === "cancel"
        ? "border-red-500 text-red-600"
        : "border-yellow-500 text-yellow-600"
    }`}
                    >
                      {r.status === "accept"
                        ? "รับสินค้าแล้ว"
                        : r.status === "cancel"
                        ? "ยกเลิกแล้ว"
                        : "รอรับสินค้า"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-between items-center p-4">
        <p className="text-sm text-muted-foreground">Page {currentPage}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &larr; Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next &rarr;
          </Button>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเปลี่ยนสถานะ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะรายการนี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedItem) return;
                const { id, status } = selectedItem;
                const newStatus = status === "packing" ? "accept" : "packing";
                const ref = doc(db, "Redemptions", id);
                await updateDoc(ref, {
                  status: newStatus,
                  updated_at: new Date(),
                });
                fetchRedemptions();
                setSelectedItem(null);
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
