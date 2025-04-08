"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserPlus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
interface UserStatsProps {
  totalUsers: number
  newUsers: number
  recentActiveUsers: number
}

export function UserStats() {
  const [stats, setStats] = useState<UserStatsProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState([])
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const usersCollection = collection(db, "user_id")

        // Get total users count
        const usersSnapshot = await getDocs(usersCollection)
        const totalUsers = usersSnapshot.size

        // Get new users (registered in the last 7 days)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const newUsersQuery = query(usersCollection, where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo)))
        const newUsersSnapshot = await getDocs(newUsersQuery)
        const newUsers = newUsersSnapshot.size

        // Get recently active users (updated in the last 24 hours)
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 3)

        const recentActiveQuery = query(usersCollection, where("update_at", ">=", Timestamp.fromDate(oneDayAgo)))
        const recentActiveSnapshot = await getDocs(recentActiveQuery)
        const recentActiveUsers = recentActiveSnapshot.size
        // ดึงข้อมูลผู้ใช้ที่ active ล่าสุด
        const recentActiveUsersId = recentActiveSnapshot.docs.map(doc => ({
            id: doc.id
        }));
        
        // ลองแสดงข้อมูลดู
        setUser(recentActiveUsersId);
        console.log("Recently active users:", recentActiveUsersId[0].id);

        setStats({
          totalUsers,
          newUsers,
          recentActiveUsers,
        })
        
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[120px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-4 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">Registered users in your system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Users</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.newUsers || 0}</div>
          <p className="text-xs text-muted-foreground">Users registered in the last 7 days</p>
        </CardContent>
      </Card>

      <Card onClick={() => setViewDialogOpen(true)} className="cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recently Active</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.recentActiveUsers || 0}</div>
          <p className="text-xs text-muted-foreground">Users active in the last 24 hours</p>
          
        </CardContent>
      </Card>
      
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Users active in the last 24 hours</DialogTitle>
            <DialogDescription>All userID active in the last 24 hours </DialogDescription>
          </DialogHeader>
          {user.map((userID, index) => (
            <p key={userID.id}>
                <div className="text-xs text-muted-foreground">
                {index + 1} : {userID.id}
                </div>
            </p>
            ))}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
