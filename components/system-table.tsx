"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, startAfter, doc, updateDoc , deleteDoc , where , addDoc, serverTimestamp} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import system from "./system"
// import { AlertDialogHeader } from "./ui/alert-dialog"

interface User {
  id: string
  name: string
  email: string
  department_id: string
  firebase_uid: string
  user_point: number
  createdAt: Date
  update_at: Date
}

interface Sensor {
  device_id: string
  location: string
  ip_address: string
  status: boolean
}

export function SystemTable() {
  const [sensor, setSensor] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filteredSensor, setFilteredSensor] = useState<Sensor[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasPrevious, setHasPrevious] = useState(false)
  const usersPerPage = 10
  const [pageCursors, setPageCursors] = useState<any[]>([]) // เก็บเอกสารสุดท้ายของแต่ละหน้า
  // Edit and view state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<Sensor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editedSystem, setEditedSystem] = useState<{
    device_id: string
    location: string
    ip_address: string
  }>({
    device_id: "",
    location: "",
    ip_address: "",
  })

  const [createSystem, setCreateSystem] = useState<{
    device_id: string
    location: string
    ip_address: string
  }>({
    device_id: "",
    location: "",
    ip_address: "",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Store the last document for pagination
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null)
  const [firstPage, setFirstPage] = useState<User[]>([])

  // const fetchUsers = async (pageNum: number) => {
  //   try {
  //     setLoading(true)
  //     const usersCollection = collection(db, "user_id")
  //     let userQuery
  
  //     if (pageNum === 1) {
  //       userQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(usersPerPage))
  //     } else {
  //       const previousCursor = pageCursors[pageNum - 2]
  //       if (!previousCursor) return
  
  //       userQuery = query(
  //         usersCollection,
  //         orderBy("createdAt", "desc"),
  //         startAfter(previousCursor),
  //         limit(usersPerPage)
  //       )
  //     }
  
  //     const userSnapshot = await getDocs(userQuery)
  //     if (userSnapshot.empty) {
  //       setHasMore(false)
  //       return
  //     }
  
  //     const userList = userSnapshot.docs.map((doc) => {
  //       const data = doc.data()
  //       return {
  //         id: doc.id,
  //         name: data.name || "N/A",
  //         email: data.email || "N/A",
  //         department_id: String(data.department_id || "N/A"),
  //         firebase_uid: data.firebase_uid || "N/A",
  //         user_point: data.user_point || 0,
  //         createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate() || new Date(),
  //         update_at: data.update_at instanceof Date ? data.update_at : data.update_at?.toDate() || new Date(),
  //       }
  //     })
  
  //     // เพิ่ม cursor สำหรับหน้าใหม่ ถ้าเป็นหน้าแรกไม่ต้องเพิ่ม
  //     if (pageNum === 1) {
  //       setPageCursors([userSnapshot.docs[userSnapshot.docs.length - 1]])
  //     } else {
  //       setPageCursors((prev) => {
  //         const newCursors = [...prev]
  //         newCursors[pageNum - 1] = userSnapshot.docs[userSnapshot.docs.length - 1]
  //         return newCursors
  //       })
  //     }
  
  //     setUsers(userList)
  //     setFilteredUsers(userList)
  //     setHasPrevious(pageNum > 1)
  //     setHasMore(userSnapshot.size === usersPerPage)
  //   } catch (error) {
  //     console.error("Error fetching users:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchSystem = async (pageNum: number) => {
    try {
      setLoading(true)
      const usersCollection = collection(db, "iot_devices")
      let userQuery
  
      if (pageNum === 1) {
        userQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(usersPerPage))
      } else {
        const previousCursor = pageCursors[pageNum - 2]
        if (!previousCursor) return
  
        userQuery = query(
          usersCollection,
          orderBy("createdAt", "desc"),
          startAfter(previousCursor),
          limit(usersPerPage)
        )
      }
  
      const userSnapshot = await getDocs(userQuery)
      if (userSnapshot.empty) {
        setHasMore(false)
        return
      }
  
      const systemList = userSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          device_id: data.device_id,
          location: data.location || "N/A",
          ip_address: data.ip_address || "N/A",
          status: data.status || "N/A",
        }
      })
  
      // เพิ่ม cursor สำหรับหน้าใหม่ ถ้าเป็นหน้าแรกไม่ต้องเพิ่ม
      if (pageNum === 1) {
        setPageCursors([userSnapshot.docs[userSnapshot.docs.length - 1]])
      } else {
        setPageCursors((prev) => {
          const newCursors = [...prev]
          newCursors[pageNum - 1] = userSnapshot.docs[userSnapshot.docs.length - 1]
          return newCursors
        })
      }
  
    //   setUsers(userList)
      setSensor(systemList)
      setFilteredSensor(systemList)
      setHasPrevious(pageNum > 1)
      setHasMore(userSnapshot.size === usersPerPage)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }
  
  

  useEffect(() => {
    // fetchUsers(1)
    fetchSystem(1)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSensor(sensor)
    } else {
      const filtered = sensor.filter(
        (sensor) =>
          (sensor.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sensor.ip_address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(sensor.device_id || "").includes(searchTerm),
      )
      setFilteredSensor(filtered)
    }
  }, [searchTerm, sensor])

  const handleDeleteClick = (system: Sensor) => {
    setSelectedSystem(system)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSensor = async () => {
    if (!selectedSystem) return

    try {
      setIsSubmitting(true)
      const collRef = collection(db, "iot_devices");
      const q = query(collRef, where("device_id", "==", selectedSystem.device_id.trim()));
      const qsnap = await getDocs(q);

      if (qsnap.empty) {
        toast({
          title: "ไม่พบอุปกรณ์",
          description: `ไม่พบ device_id="${selectedSystem.device_id}"`,
          variant: "destructive",
        });
        return;
      }

      // ลบเอกสารที่ตรงเงื่อนไขทั้งหมด
      const deletePromises = qsnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "iot_devices", docSnap.id))
      );
      await Promise.all(deletePromises);

      // Update local state
      const updatedSensor = sensor.filter((sensor) => sensor.device_id !== selectedSystem.device_id)
      setSensor(updatedSensor)
      setFilteredSensor(updatedSensor)

      toast({
        title: "Sensor deleted",
        description: "Sensor has been successfully deleted",
      })

      // Close dialog
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting Sensor:", error)
      toast({
        title: "Error",
        description: "Failed to delete Sensor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleNextPage = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchSystem(nextPage)
    }
  }
  
  const handlePrevPage = () => {
    if (page > 1 && !loading) {
      const prevPage = page - 1
      setPage(prevPage)
      fetchSystem(prevPage)
    }
  }
  
  // const handleNextPage = () => {
    
  //   if (hasMore && !loading) {
  //     const nextPage = page + 1
  //     setPage((prev) => prev + 1)
  //     fetchUsers(nextPage)
  //   }
  // }

  // const handlePrevPage = () => {
  //   if (page > 1 && !loading) {
  //     const prevPage = page - 1
  //     setPage(prevPage)

  //     if (prevPage === 1) {
  //       // Use cached first page
  //       setUsers(firstPage)
  //       setFilteredUsers(firstPage)
  //       setHasPrevious(false)
  //       setHasMore(true)
  //     } else {
  //       // Need to implement fetching previous pages
  //       // This would require storing cursors for each page
  //       // For simplicity, we'll just go back to page 1
  //       setPage(prevPage)
  //       fetchUsers(1)
  //     }
  //   }
  // }

  const handleEditClick = (system: Sensor) => {
    setSelectedSystem(system)
    setEditedSystem({
      device_id : system.device_id,
      ip_address: system.ip_address,
      location: system.location,
    })
    setEditDialogOpen(true)
  }

  const handleCreateClick = () => {
    setCreateDialogOpen(true)
  }

  const handleViewClick = (system: Sensor) => {
    setSelectedSystem(system)
    setViewDialogOpen(true)
  }

  const handleCreateSensor = async () => {
  if (!createSystem) return;

  // 🚫 ตรวจสอบฟิลด์ว่าง
  const { device_id, location, ip_address } = createSystem;
  if (!device_id.trim() || !location.trim() || !ip_address.trim()) {
    toast({
      title: "กรอกข้อมูลไม่ครบ",
      description: "กรุณากรอก device ID, location และ IP address ให้ครบ",
      variant: "destructive",
    });
    return;
  }

  try {
    setIsSubmitting(true);

    // 🔎 เช็คว่า device_id ซ้ำหรือไม่
    const collRef = collection(db, "iot_devices");
    const q = query(collRef, where("device_id", "==", device_id.trim()));
    const qsnap = await getDocs(q);

    if (!qsnap.empty) {
      toast({
        title: "Device ID ซ้ำ",
        description: `อุปกรณ์ที่มี ID "${device_id}" เคยถูกสร้างแล้ว`,
        variant: "destructive",
      });
      return;
    }

    // 🆕 สร้างเอกสารใหม่
    const docRef = await addDoc(collRef, {
      device_id: device_id.trim(),
      location: location.trim(),
      ip_address: ip_address.trim(),
      status: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("สร้างเอกสารสำเร็จ ID:", docRef.id);

    // 🔄 อัปเดต state (เพิ่มอุปกรณ์ใหม่เข้า list)
    setSensor(prev => [
      ...prev,
      {
        device_id: device_id.trim(),
        location: location.trim(),
        ip_address: ip_address.trim(),
        status: true,
      }
    ]);

    toast({ title: "เพิ่มอุปกรณ์สำเร็จ", variant: "success" });

  } catch (error) {
    console.error("สร้างเอกสารผิดพลาด:", error);
    toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSaveEdit = async () => {
    if (!selectedSystem) return

    // Validate inputs
    if (!editedSystem.device_id.trim()) {
      toast({
        title: "Missing location",
        description: "Please enter a name for the user",
        variant: "destructive",
      })
      return
    }

    if (!editedSystem.location.trim() || !editedSystem.ip_address.trim()) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const collRef = collection(db, "iot_devices");
      const q = query(collRef, where("device_id", "==", selectedSystem.device_id));
      const qsnap = await getDocs(q);

      if (qsnap.empty) {
        console.error("ไม่พบ document สำหรับ device_id:", selectedSystem.device_id);
        setIsSubmitting(false);
        return;
      }

      // 2. อัปเดตทุกเอกสารที่เจอ
      const promises = [];
      qsnap.forEach((docSnap) => {
        const ref = docSnap.ref;
        promises.push(updateDoc(ref, {
          device_id: editedSystem.device_id,
          location: editedSystem.location,
          ip_address: editedSystem.ip_address,
        }));
      });
      await Promise.all(promises);


      // Update local state
      const updatedSensor = sensor.map((sensor) =>
        sensor.device_id === selectedSystem.device_id
          ? {
              ...sensor,
              device_id: editedSystem.device_id,
              location: editedSystem.location,
              ip_address: editedSystem.ip_address,
            }
          : sensor,
      )

      setSensor(updatedSensor)
      setFilteredSensor(
        searchTerm.trim() === ""
          ? updatedSensor
          : updatedSensor.filter(
              (sensor) =>
                sensor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sensor.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sensor.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ,
               
            ),
      )

      toast({
        title: "Sensor updated",
        description: "Sensor information has been successfully updated",
      })

      // Close dialog
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating Sensor:", error)
      toast({
        title: "Error",
        description: "Failed to update Sensor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }


  if (loading && page === 1) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-[250px] mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          type="button"
          className="ml-auto flex-shrink-0
    bg-green-600 text-white
    hover:bg-green-700
    active:bg-green-800
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500
    transition-colors duration-200"
        onClick={handleCreateClick}
        >
          Create Device +
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Websocket ip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSensor.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No Sensor Found
                </TableCell>
              </TableRow>
            ) : (
              filteredSensor.map((data) => (
                <TableRow key={data.device_id}>
                  <TableCell className="font-medium">{data.device_id}</TableCell>
                  <TableCell className="font-medium">{data.location}</TableCell>
                  <TableCell>{data.ip_address}</TableCell>
                  <TableCell>{data.status == true ? (
                    <div className="text-gray-100 w-24 text-center h-6 rounded-full bg-green-600">Active Now</div>
                  ) : (
                    <div className="text-gray-100 w-24 h-6 text-center rounded-full bg-red-600">Error Sensor</div>
                  )
                  }</TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewClick(data)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(data)}>Edit Sensor</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(data)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete Sensor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {page}</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1 || loading}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasMore || loading}>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to user information here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Location
              </Label>
              <Input
                id="name"
                value={editedSystem.location}
                onChange={(e) => setEditedSystem({ ...editedSystem, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Ip Address
              </Label>
              <Input
                id="ip_address"
                value={editedSystem.ip_address}
                onChange={(e) => setEditedSystem({ ...editedSystem, ip_address: e.target.value })}
                className="col-span-3"
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sensor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Sensor</DialogTitle>
            <DialogDescription>Create information here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Device Id
              </Label>
              <Input
                id="device_id"
                value={createSystem.device_id}
                onChange={(e) => setCreateSystem({ ...createSystem, device_id: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Location
              </Label>
              <Input
                id="name"
                value={createSystem.location}
                onChange={(e) => setCreateSystem({ ...createSystem, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Ip Address
              </Label>
              <Input
                id="ip_address"
                value={createSystem.ip_address}
                onChange={(e) => setCreateSystem({ ...createSystem, ip_address: e.target.value })}
                className="col-span-3"
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateSensor} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Create...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user.</DialogDescription>
          </DialogHeader>
          {selectedSystem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Id</h3>
                  <p className="text-base">{selectedSystem.device_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="text-base">{selectedSystem.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Ip Address</h3>
                  <p className="text-base">{selectedSystem.ip_address}</p>
                </div>
             
              </div>
              {/* {isNewUser(selectedUser.createdAt) && <Badge className="bg-green-500 hover:bg-green-600">New User</Badge>} */}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => handleEditClick(selectedSystem!)} className="mr-auto">
              Edit System
            </Button>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSensor}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
