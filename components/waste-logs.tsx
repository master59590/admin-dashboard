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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface WasteLog {
  id: string;
  waste_type: string;
  timestamp: Date;
  user_id: string;
  username?: string;
  department?: string;
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
  const [selectedWasteType, setSelectedWasteType] = useState<string>("all");
  const [everyday, setEveryday] = useState(true);
  const [wasteTypes, setWasteTypes] = useState<string[]>([]);
  const [searchBy, setSearchBy] = useState<"user_id" | "name">("user_id");
  const [searchText, setSearchText] = useState("");

  const [searchResults, setSearchResults] = useState<
    { id: string; name: string }[]
  >([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState<string>("__ALL__");
  const [selecteBin, setSelectedBin] = useState<string>("");
  const [departments, setDepartments] = useState<
    { id: string; title: string }[]
  >([]);

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

          const userRef = doc(db, "user_id", data.user_id);
          const userSnap = await getDoc(userRef);
          const userInfo = userSnap.exists() ? userSnap.data() : {};

          let departmentName = "";
          if (userInfo.department_id) {
            const deptRef = doc(db, "department_id", userInfo.department_id);
            const deptSnap = await getDoc(deptRef);
            if (deptSnap.exists()) {
              departmentName = deptSnap.data().job_title || "";
            }
          }
          return {
            id: docData.id,
            waste_type: wasteTypeId || "unknown",
            timestamp:
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate()
                : new Date(),
            user_id: data.user_id || "",
            username: userInfo.name || "",
            department: departmentName || "", // ✅ เพิ่มชื่อแผนก
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
  const handleSearch = async () => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const userRef = collection(db, "user_id");

    if (searchBy === "user_id") {
      const docRef = doc(userRef, searchText.trim());
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { name: string };
        if (data) {
          setSearchResults([{ id: snap.id, ...data }]);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } else if (searchBy === "name") {
      const normalizedSearch = searchText
        .trim()
        .replace(/\s/g, "")
        .toLowerCase();

      const snap = await getDocs(collection(db, "user_id"));

      const results = snap.docs
        .map((doc) => {
          const data = doc.data();
          const normalizedName = (data.name || "")
            .replace(/\s/g, "")
            .toLowerCase();

          if (normalizedName.includes(normalizedSearch)) {
            return {
              id: doc.id,
              name: data.name,
            };
          }

          return null;
        })
        .filter((r): r is { id: string; name: string } => r !== null);

      setSearchResults(results);
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setSearchBy("user_id");
    setSelectedWasteType("all");
    setSelectedDepartment("__ALL__");
    setSelectedBin("");
    setEveryday(true);
    setSelectedDate(new Date().toISOString().slice(0, 10));
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

    const fetchDepartments = async () => {
      const deptSnap = await getDocs(collection(db, "department_id"));
      const deptList: { id: string; title: string }[] = [];

      deptSnap.forEach((doc) => {
        const data = doc.data();
        deptList.push({
          id: doc.id,
          title: data.job_title || "(ไม่ระบุ)",
        });
      });

      // เรียงตามชื่อแผนก A-Z
      deptList.sort((a, b) => a.title.localeCompare(b.title));

      setDepartments(deptList);
    };
    fetchLogs();
    fetchWasteTypes();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const searchTermLower = searchText.toLowerCase();
    const term = searchText.trim().toLowerCase();

    const filtered = logs.filter((log) => {
      const matchesSearch =
        (searchBy === "name" &&
          (log.username ?? "").toLowerCase().includes(term)) ||
        (searchBy === "user_id" && log.user_id.toLowerCase().includes(term));
      // ถ้าไม่มีการค้นหา (term เป็นค่าว่าง) ให้แสดงผลทั้งหมด
      if (term !== "" && !matchesSearch) return false;

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

      const matchesDepartment =
        selectedDepartment === "__ALL__" ||
        log.department === selectedDepartment;

      return (
        (term === "" || matchesSearch) &&
        matchesSearch &&
        matchesDate &&
        matchesWasteType &&
        matchesDepartment
      );
    });

    setFilteredLogs(filtered);
  }, [
    searchText,
    searchBy,
    logs,
    selectedDate,
    selectedWasteType,
    selectedDepartment,
  ]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(); // เรียกเมื่อพิมพ์เสร็จสักพัก
    }, 300); // หน่วง 300ms

    return () => clearTimeout(delayDebounce); // เคลียร์เมื่อพิมพ์ใหม่
  }, [searchText, searchBy]);

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
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Dropdown: ค้นหาด้วยอะไร */}
              <Select
                value={searchBy}
                onValueChange={(val: "user_id" | "name") => setSearchBy(val)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="ค้นหาด้วย..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_id">User ID</SelectItem>
                  <SelectItem value="name">ชื่อผู้ใช้</SelectItem>
                </SelectContent>
              </Select>
              <span> : </span>
              {/* กล่องค้นหา */}
              <Input
                placeholder={`พิมพ์ ${
                  searchBy === "name" ? "ชื่อผู้ใช้" : "User ID"
                }`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Waste Type */}
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

            {/* Department */}
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.title}>
                    {dept.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bin */}
            <Select
              value={selecteBin}
              onValueChange={(value) => setSelectedBin(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ALL Bin" />
              </SelectTrigger>
              <SelectContent>{/* ยังไม่มี options จริง */}</SelectContent>
            </Select>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:mr-auto">
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

            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center space-x-1 px-4 py-2 text-base md:ml-auto"
            >
              <RefreshCw className="h-5 w-5" />
              <span>รีเซ็ตตัวกรอง</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Waste Type</TableHead>
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
                      <TableCell>{log.user_id}</TableCell>
                      <TableCell>{log.username}</TableCell>
                      <TableCell>{log.department}</TableCell>
                      <TableCell>{log.location}</TableCell>
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
