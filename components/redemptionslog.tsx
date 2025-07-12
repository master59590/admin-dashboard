"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Redemption {
  id: string;
  coupon: string;
  user_id: string;
  reward_id: string;
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

  const fetchRedemptions = async () => {
    setLoading(true);
    const q = query(
      collection(db, "Redemptions"),
      orderBy("created_at", "desc")
    );
    const snap = await getDocs(q);
    const list: Redemption[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
      created_at: doc.data().created_at?.toDate?.() ?? new Date(),
      updated_at: doc.data().updated_at?.toDate?.() ?? new Date(),
    }));
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
    const matchSearch =
      r.user_id.includes(search) ||
      r.reward_id.includes(search) ||
      r.coupon.includes(search);

    const matchStatus = filterStatus === "all" || r.status === filterStatus;

    return matchSearch && matchStatus;
  });

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
      <h2 className="text-2xl font-semibold mb-4">Redemption Management</h2>
      <div className="flex mb-4 gap-2 items-center">
        <Input
          placeholder="Search by coupon, user_id, or reward_id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
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
                <TableHead>Points Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.coupon}</TableCell>
                  <TableCell>{r.user_id}</TableCell>
                  <TableCell>{r.reward_id}</TableCell>
                  <TableCell>{r.points_used}</TableCell>
                  <TableCell>
                    <span className="capitalize font-medium">{r.status}</span>
                  </TableCell>
                  <TableCell>
                    {format(r.created_at, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => toggleStatus(r.id, r.status)}
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
    </div>
  );
}
