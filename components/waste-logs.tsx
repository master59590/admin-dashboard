"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface WasteLog {
  id: string;
  waste_type: string;
  timestamp: Date;
  user_id: string;
  garbage_type_sensor: boolean;
  location?: string;
  bin_id?: string;
  confidence?: number;
  status?: string;
  waste_name?: string;
}

// const WASTE_TYPES: Record<string, string> = {
//   "00001": "Organic",
//   "00002": "Recyclable",
//   "00003": "General",
//   "00004": "Hazardous",
//   "00005": "Recycled",
//   "00006": "Incinerated",
//   "00007": "Landfilled",
// };

export function WasteLogs() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<WasteLog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const logsPerPage = 10;
  const [selectedWasteType, setSelectedWasteType] = useState<string>("");
  const [everyday, setEveryday] = useState(true);
  const [wasteTypes, setWasteTypes] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // yyyy-mm-dd
  });

  const fetchLogs = async (nextPage = false) => {
    try {
      setLoading(true);
      const logsCollection = collection(db, "waste_management_id");

      let logsQuery;
      if (nextPage && lastVisible) {
        logsQuery = query(
          logsCollection,
          orderBy("timestamp", "desc"),
          startAfter(lastVisible),
          limit(logsPerPage)
        );
      } else {
        logsQuery = query(
          logsCollection,
          orderBy("timestamp", "desc"),
          limit(logsPerPage)
        );
      }

      const logsSnapshot = await getDocs(logsQuery);

      if (logsSnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Set the last document for pagination
      setLastVisible(logsSnapshot.docs[logsSnapshot.docs.length - 1]);

      const logsList = await Promise.all(
        logsSnapshot.docs.map(async (docData) => {
          const data = docData.data();
          const wasteTypeId = data.waste_type;

          // ดึงข้อมูล waste_type จาก collection waste_type
          const wasteTypeRef = doc(db, "waste_type", wasteTypeId);
          const wasteTypeSnap = await getDoc(wasteTypeRef);
          const wasteTypeInfo = wasteTypeSnap.exists()
            ? wasteTypeSnap.data()
            : {};

          return {
            id: docData.id,
            waste_type: wasteTypeId || "unknown",
            timestamp:
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate()
                : new Date(),
            user_id: data.user_id || "",
            location: wasteTypeInfo.waste_type || "unknown", // ใช้ในคอลัมน์ Waste Type
            waste_name: wasteTypeInfo.waste_name || "unknown", // เพิ่ม field ใหม่ไว้แสดง Waste Name
            garbage_type_sensor: data.garbage_type_sensor || false,
            bin_id: data.bin_id || "BIN-" + Math.floor(Math.random() * 1000),
          };
        })
      );

      setLogs(logsList);
      setFilteredLogs(logsList);
      setHasMore(logsSnapshot.size === logsPerPage);
    } catch (error) {
      console.error("Error fetching waste logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWasteTypes = async () => {
      const snapshot = await getDocs(collection(db, "waste_type"));
      const resultSet = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.waste_type) {
          resultSet.add(data.waste_type);
        }
      });

      setWasteTypes(Array.from(resultSet)); // แปลง Set กลับเป็น Array
    };
    fetchLogs();
    fetchWasteTypes();
  }, []);

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();

    const filtered = logs.filter((log) => {
      const matchesSearch =
        (log.location || "").toLowerCase().includes(searchTermLower) ||
        log.user_id.toLowerCase().includes(searchTermLower) ||
        (log.location || "").toLowerCase().includes(searchTermLower) ||
        (log.bin_id || "").toLowerCase().includes(searchTermLower) ||
        (log.status || "").toLowerCase().includes(searchTermLower);

      const matchesDate = everyday
        ? true
        : (() => {
            const targetDate = new Date(selectedDate);
            const logDate = new Date(log.timestamp);

            return (
              logDate.getFullYear() === targetDate.getFullYear() &&
              logDate.getMonth() === targetDate.getMonth() &&
              logDate.getDate() === targetDate.getDate()
            );
          })();

      const matchesWasteType =
        selectedWasteType === "all" || !selectedWasteType
          ? true
          : log.location === selectedWasteType;

      return matchesSearch && matchesDate && matchesWasteType;
    });

    setFilteredLogs(filtered);
  }, [searchTerm, logs, selectedDate, selectedWasteType]);

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
      fetchLogs(true);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      // For simplicity, we'll just go back to page 1
      // In a real app, you'd want to store cursors for each page
      //   setPage(1)
      fetchLogs(false);
    }
  };

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Analyzed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Analyzed</Badge>
        );
      case "Collected":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Collected</Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  if (loading && page === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waste Logs</CardTitle>
          <CardDescription>
            Detailed records of waste disposal activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px]" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste Logs</CardTitle>
        <CardDescription>
          Detailed records of waste disposal activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-10 items-start md:items-center w-full">
            {/* Search (อยู่ซ้าย) */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* กล่องขวา: Checkbox + Date */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <label className="flex items-center whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={everyday}
                  onChange={() => {
                    const newVal = !everyday;
                    setEveryday(newVal);
                    if (newVal) {
                      setSelectedDate("");
                    } else {
                      const today = new Date().toISOString().slice(0, 10);
                      setSelectedDate(today);
                    }
                  }}
                />
                <span className="ml-2">
                  {everyday
                    ? "เลือกดูข้อมูลแบบทุกวัน"
                    : "เลือกดูข้อมูลเฉพาะบางวัน"}
                </span>
              </label>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={everyday}
                className="max-w-[180px]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Select
              value={selectedWasteType || undefined}
              onValueChange={(value) => setSelectedWasteType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Waste Type</SelectItem>
                {wasteTypes.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Waste Name</TableHead>
                  <TableHead>Bin ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No waste logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell>{log.user_id}</TableCell>
                      <TableCell>{log.waste_name}</TableCell>
                      <TableCell>{log.bin_id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {page}</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
