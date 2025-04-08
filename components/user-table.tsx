"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, startAfter, doc, updateDoc } from "firebase/firestore"
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

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasPrevious, setHasPrevious] = useState(false)
  const usersPerPage = 10

  // Edit and view state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editedUser, setEditedUser] = useState<{
    name: string
    email: string
    department_id: string
    user_point: number
  }>({
    name: "",
    email: "",
    department_id: "",
    user_point: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Store page cursors for navigation
  const [pageCursors, setPageCursors] = useState<any[]>([null])

  const fetchUsers = async (direction: "next" | "prev" = "next") => {
    try {
      setLoading(true)
      const usersCollection = collection(db, "user_id")
      let userQuery

      if (direction === "next") {
        // Get next page
        const cursor = pageCursors[page - 1]
        userQuery = cursor
          ? query(usersCollection, orderBy("createdAt", "desc"), startAfter(cursor), limit(usersPerPage))
          : query(usersCollection, orderBy("createdAt", "desc"), limit(usersPerPage))

        const userSnapshot = await getDocs(userQuery)

        if (!userSnapshot.empty) {
          // Store the last document as cursor for the next page
          const lastDoc = userSnapshot.docs[userSnapshot.docs.length - 1]

          // Update page cursors array
          if (page >= pageCursors.length) {
            setPageCursors([...pageCursors, lastDoc])
          } else {
            const newCursors = [...pageCursors]
            newCursors[page] = lastDoc
            setPageCursors(newCursors.slice(0, page + 1))
          }

          processUserData(userSnapshot)
          setHasMore(userSnapshot.size === usersPerPage)
          setHasPrevious(page > 1)
        } else {
          setHasMore(false)
        }
      } else {
        // Get previous page
        if (page > 1) {
          // Use the cursor from the previous page
          const cursor = pageCursors[page - 2] // -2 because we're going back

          if (cursor === null) {
            // First page
            userQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(usersPerPage))
          } else {
            // Use the cursor to get documents before it
            userQuery = query(usersCollection, orderBy("createdAt", "desc"), startAfter(cursor), limit(usersPerPage))
          }

          const userSnapshot = await getDocs(userQuery)

          if (!userSnapshot.empty) {
            processUserData(userSnapshot)
            setHasMore(true)
            setHasPrevious(page - 1 > 1)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const processUserData = (snapshot: any) => {
    const userList = snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "N/A",
        email: data.email || "N/A",
        department_id: String(data.department_id || "N/A"), // Ensure department_id is a string
        firebase_uid: data.firebase_uid || "N/A",
        user_point: data.user_point || 0,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate() || new Date(),
        update_at: data.update_at instanceof Date ? data.update_at : data.update_at?.toDate() || new Date(),
      }
    })

    setUsers(userList)
    setFilteredUsers(userList)
  }

  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        const usersCollection = collection(db, "user_id")
        const userQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(usersPerPage))

        const userSnapshot = await getDocs(userQuery)

        if (!userSnapshot.empty) {
          // Store the last document as cursor for the next page
          const lastDoc = userSnapshot.docs[userSnapshot.docs.length - 1]
          setPageCursors([null, lastDoc]) // null for first page, lastDoc for second page

          processUserData(userSnapshot)
          setHasMore(userSnapshot.size === usersPerPage)
          setHasPrevious(false) // First page has no previous
        } else {
          setHasMore(false)
        }
      } catch (error) {
        console.error("Error in initial fetch:", error)
      } finally {
        setLoading(false)
      }
    }

    initialFetch()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(user.department_id || "").includes(searchTerm), // Convert to string and handle null/undefined
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1)
      fetchUsers("next")
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1)
      fetchUsers("prev")
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditedUser({
      name: user.name,
      email: user.email,
      department_id: user.department_id,
      user_point: user.user_point,
    })
    setEditDialogOpen(true)
  }

  const handleViewClick = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    // Validate inputs
    if (!editedUser.name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a name for the user",
        variant: "destructive",
      })
      return
    }

    if (!editedUser.email.trim() || !editedUser.email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Update in Firestore
      const userRef = doc(db, "user_id", selectedUser.id)
      await updateDoc(userRef, {
        name: editedUser.name,
        email: editedUser.email,
        department_id: editedUser.department_id,
        user_point: Number(editedUser.user_point),
        update_at: new Date(),
      })

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: editedUser.name,
              email: editedUser.email,
              department_id: editedUser.department_id,
              user_point: Number(editedUser.user_point),
              update_at: new Date(),
            }
          : user,
      )

      setUsers(updatedUsers)
      setFilteredUsers(
        searchTerm.trim() === ""
          ? updatedUsers
          : updatedUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(user.department_id).includes(searchTerm),
            ),
      )

      toast({
        title: "User updated",
        description: "User information has been successfully updated",
      })

      // Close dialog
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
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

  const isNewUser = (date: Date) => {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return date > oneWeekAgo
    } catch (error) {
      return false
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
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department ID</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department_id}</TableCell>
                  <TableCell>{user.user_point}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {isNewUser(user.createdAt) && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewClick(user)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit user</DropdownMenuItem>
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
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
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
                Name
              </Label>
              <Input
                id="name"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department ID
              </Label>
              <Input
                id="department"
                value={editedUser.department_id}
                onChange={(e) => setEditedUser({ ...editedUser, department_id: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={editedUser.user_point}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, user_point: e.target.value ? Number(e.target.value) : 0 })
                }
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

      {/* View User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-base">{selectedUser.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department ID</h3>
                  <p className="text-base">{selectedUser.department_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Points</h3>
                  <p className="text-base">{selectedUser.user_point}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Firebase UID</h3>
                  <p className="text-base break-all">{selectedUser.firebase_uid}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p className="text-base">{selectedUser.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-base">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="text-base">{formatDate(selectedUser.update_at)}</p>
                </div>
              </div>
              {isNewUser(selectedUser.createdAt) && <Badge className="bg-green-500 hover:bg-green-600">New User</Badge>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => handleEditClick(selectedUser!)} className="mr-auto">
              Edit User
            </Button>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
