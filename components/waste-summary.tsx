"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { set } from "date-fns"

interface WasteData {
  id: string
  waste_type: string
  timestamp: Date
  user_id: string
}

interface WasteType {
  id: string
  waste_type: string
}

interface WasteSummaryData {
  totalWaste: number
  wasteByType: {
    organic: number
    recyclable: number
    general: number
    hazardous: number
  }
  wasteByDisposal: {
    recycled: number
    incinerated: number
    landfilled: number
  }
  dailyData: any[]
  weeklyData: any[]
  monthlyData: any[]
  yearlyData: any[]
}

const WASTE_TYPES: Record<string, string> = {
  "00001": "Organic",
  "00002": "Recyclable",
  "00003": "General",
  "00004": "Hazardous",
  "00005": "Recycled",
  "00006": "Incinerated",
  "00007": "Landfilled",
}

const COLORS = ["#4ade80", "#60a5fa", "#f97316", "#f43f5e", "#a78bfa", "#facc15", "#94a3b8"]

export function WasteSummary() {
  const [loading, setLoading] = useState(true)
  const [organic, setOrganic] = useState<number>(0)
  const [recyclable, setRecyclable] = useState<number>(0)
  const [general, setGeneral] = useState<number>(0)
  const [hazardous, setHazardous] = useState<number>(0)
  const [summaryData, setSummaryData] = useState<WasteSummaryData>({
    totalWaste: 0,
    wasteByType: {
      organic: 0,
      recyclable: 0,
      general: 0,
      hazardous: 0,
    },
    wasteByDisposal: {
      recycled: 0,
      incinerated: 0,
      landfilled: 0,
    },
    dailyData: [],
    weeklyData: [],
    monthlyData: [],
    yearlyData: [],
  })
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")

  useEffect(() => {
    async function fetchWasteData() {
      try {
        setLoading(true)
        const wasteCollection = collection(db, "waste_management_id")
        const wasteSnapshot = await getDocs(wasteCollection)

        if (wasteSnapshot.empty) {
          setLoading(false)
          return
        }

        const wasteData: WasteData[] = wasteSnapshot.docs.map((doc) => {
          const data = doc.data()
                
          return {
            id: doc.id,
            waste_type: data.waste_type || "unknown",
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            user_id: data.user_id || "",
          }
        })

        const wasteCollectionWasteType = collection(db, "waste_type")
        const wasteSnapshotWasteType = await getDocs(wasteCollectionWasteType)

        if (wasteSnapshotWasteType.empty) {
          setLoading(false)
          return
        }

        const wasteType: WasteType[] = wasteSnapshotWasteType.docs.map((doc) => {
          const data = doc.data()
                
          return {
            id: doc.id,
            waste_type: data.waste_type || "unknown",
          }
        })
        

        // Process data for summary
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const summary = wasteData.map((type) => {


          return {
            id: type.id,
            waste_type: type.waste_type,
            count: wasteData.filter((w) => w.waste_type === type.id).length
          }
        })

        let tempOrganic = 0
        let tempRecyclable = 0
        let tempGeneral = 0
        let tempHazardous = 0
        

        const summaryType = wasteType.map((type) => {
          var  id = type.id
          var  name =  type.waste_type
          const filterType = summary.filter((w) => w.waste_type === id).length
           if (name === "hazardous waste") {
            tempHazardous += filterType
          } else if (name === "organic waste") {
            tempOrganic += filterType
          } else if (name === "recyclable waste") {
            tempRecyclable += filterType
          } else if (name === "general waste") {
            tempGeneral += filterType
          }
          
          console.log("Summary:")
          return {
            id: id,
            filterType: filterType,
            Typename: name,
          }
        })

        // Count by waste type
        const wasteByType = {
          organic: tempOrganic,
          recyclable: tempRecyclable,
          general: tempGeneral,
          hazardous: tempHazardous,
        }

        // console.log("Waste by type:", wasteType[0].id)

        // Count by disposal method
        const wasteByDisposal = {
          recycled: wasteData.filter((w) => w.waste_type === "00005").length,
          incinerated: wasteData.filter((w) => w.waste_type === "00006").length,
          landfilled: wasteData.filter((w) => w.waste_type === "00007").length,
        }

        // Daily data (last 24 hours by hour)
        const dailyData: any[] = []
        for (let i = 0; i < 24; i++) {
          const hourStart = new Date(now)
          hourStart.setHours(now.getHours() - 23 + i, 0, 0, 0)
          const hourEnd = new Date(hourStart)
          hourEnd.setHours(hourStart.getHours() + 1)

          const hourData = wasteData.filter((w) => w.timestamp >= hourStart && w.timestamp < hourEnd)
          
          let tempOrganic = 0
          let tempRecyclable = 0
          let tempGeneral = 0
          let tempHazardous = 0
          
          const summaryType = wasteType.map((type) => {
            var  id = type.id
            var  name =  type.waste_type
            const filterType = hourData.filter((w) => w.waste_type === id).length
             if (name === "hazardous waste") {
              tempHazardous += filterType
            } else if (name === "organic waste") {
              tempOrganic += filterType
            } else if (name === "recyclable waste") {
              tempRecyclable += filterType
            } else if (name === "general waste") {
              tempGeneral += filterType
            }
            
            console.log("Summary:")
            return {
              id: id,
              filterType: filterType,
              Typename: name,
            }
          })

          dailyData.push({
            hour: hourStart.getHours(),
            time: `${hourStart.getHours()}:00`,
            total: hourData.length,
            organic: tempOrganic,
            recyclable: tempRecyclable,
            general: tempGeneral,
            hazardous: tempHazardous,
          })
        }

        // Weekly data (last 7 days)
        const weeklyData: any[] = []
        for (let i = 0; i < 7; i++) {
          const dayStart = new Date(now)
          dayStart.setDate(now.getDate() - 6 + i)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(dayStart)
          dayEnd.setHours(23, 59, 59, 999)

          const dayData = wasteData.filter((w) => w.timestamp >= dayStart && w.timestamp <= dayEnd)

          let tempOrganic = 0
          let tempRecyclable = 0
          let tempGeneral = 0
          let tempHazardous = 0
          
          const summaryType = wasteType.map((type) => {
            var  id = type.id
            var  name =  type.waste_type
            const filterType = dayData.filter((w) => w.waste_type === id).length
             if (name === "hazardous waste") {
              tempHazardous += filterType
            } else if (name === "organic waste") {
              tempOrganic += filterType
            } else if (name === "recyclable waste") {
              tempRecyclable += filterType
            } else if (name === "general waste") {
              tempGeneral += filterType
            }
            
            console.log("Summary:")
            return {
              id: id,
              filterType: filterType,
              Typename: name,
            }
          })

          weeklyData.push({
            date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
            total: dayData.length,
            organic: tempOrganic,
            recyclable: tempRecyclable,
            general: tempGeneral,
            hazardous: tempHazardous,
          })
        }

        // Monthly data (last 30 days by week)
        const monthlyData: any[] = []
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - 28 + i * 7)
          weekStart.setHours(0, 0, 0, 0)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          weekEnd.setHours(23, 59, 59, 999)

          const weekData = wasteData.filter((w) => w.timestamp >= weekStart && w.timestamp <= weekEnd)

          let tempOrganic = 0
          let tempRecyclable = 0
          let tempGeneral = 0
          let tempHazardous = 0
          
          const summaryType = wasteType.map((type) => {
            var  id = type.id
            var  name =  type.waste_type
            const filterType = weekData.filter((w) => w.waste_type === id).length
             if (name === "hazardous waste") {
              tempHazardous += filterType
            } else if (name === "organic waste") {
              tempOrganic += filterType
            } else if (name === "recyclable waste") {
              tempRecyclable += filterType
            } else if (name === "general waste") {
              tempGeneral += filterType
            }
            
            console.log("Summary:")
            return {
              id: id,
              filterType: filterType,
              Typename: name,
            }
          })
          monthlyData.push({
            week: `Week ${i + 1}`,
            total: weekData.length,
            organic: tempOrganic,
            recyclable: tempRecyclable,
            general: tempGeneral,
            hazardous: tempHazardous,
          })
        }

        const yearlyData: any[] = []

        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999)

          const monthData = wasteData.filter((w) => w.timestamp >= monthStart && w.timestamp <= monthEnd)

          let tempOrganic = 0
          let tempRecyclable = 0
          let tempGeneral = 0
          let tempHazardous = 0

          const summaryType = wasteType.map((type) => {
            const id = type.id
            const name = type.waste_type
            const filterType = monthData.filter((w) => w.waste_type === id).length

            if (name === "hazardous waste") {
              tempHazardous += filterType
            } else if (name === "organic waste") {
              tempOrganic += filterType
            } else if (name === "recyclable waste") {
              tempRecyclable += filterType
            } else if (name === "general waste") {
              tempGeneral += filterType
            }

            return {
              id: id,
              filterType: filterType,
              Typename: name,
            }
          })

          yearlyData.push({
            month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
            total: monthData.length,
            organic: tempOrganic,
            recyclable: tempRecyclable,
            general: tempGeneral,
            hazardous: tempHazardous,
          })
        }


        setSummaryData({
          totalWaste: tempOrganic + tempRecyclable + tempGeneral + tempHazardous,
          wasteByType,
          wasteByDisposal,
          dailyData,
          weeklyData,
          monthlyData,
          yearlyData
        })
      } catch (error) {
        console.error("Error fetching waste data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWasteData()
  }, [])

  const getChartData = () => {
    switch (timeRange) {
      case "daily":
        return summaryData.dailyData
      case "weekly":
        return summaryData.weeklyData
      case "monthly":
        return summaryData.monthlyData
      case "yearly":
        return summaryData.yearlyData  
      default:
        return summaryData.dailyData
    }
  }

  const getXAxisKey = () => {
    switch (timeRange) {
      case "daily":
        return "time"
      case "weekly":
        return "date"
      case "monthly":
        return "week"
      case "yearly":
        return "month"
      default:
        return "time"
    }
  }

  const wasteTypeData = [
    { name: "Organic", value: summaryData.wasteByType.organic },
    { name: "Recyclable", value: summaryData.wasteByType.recyclable },
    { name: "General", value: summaryData.wasteByType.general },
    { name: "Hazardous", value: summaryData.wasteByType.hazardous },
  ]

  const wasteDisposalData = [
    { name: "Recycled", value: summaryData.wasteByDisposal.recycled },
    { name: "Incinerated", value: summaryData.wasteByDisposal.incinerated },
    { name: "Landfilled", value: summaryData.wasteByDisposal.landfilled },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[120px]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalWaste}</div>
            <p className="text-xs text-muted-foreground">Total waste entries recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organic Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.wasteByType.organic}</div>
            <p className="text-xs text-muted-foreground">Compostable waste items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recyclable Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.wasteByType.recyclable}</div>
            <p className="text-xs text-muted-foreground">Recyclable materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hazardous Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.wasteByType.hazardous}</div>
            <p className="text-xs text-muted-foreground">Dangerous or toxic materials</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waste Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" onValueChange={(value) => setTimeRange(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">yearly</TabsTrigger>
              </TabsList>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-1))",
                    },
                    organic: {
                      label: "Organic",
                      color: "hsl(var(--chart-2))",
                    },
                    recyclable: {
                      label: "Recyclable",
                      color: "hsl(var(--chart-3))",
                    },
                    general: {
                      label: "General",
                      color: "hsl(var(--chart-4))",
                    },
                    hazardous: {
                      label: "Hazardous",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={getXAxisKey()} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                      <Line type="monotone" dataKey="organic" stroke="var(--color-organic)" />
                      <Line type="monotone" dataKey="recyclable" stroke="var(--color-recyclable)" />
                      <Line type="monotone" dataKey="general" stroke="var(--color-general)" />
                      <Line type="monotone" dataKey="hazardous" stroke="var(--color-hazardous)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-1">
          <Card >
            <CardHeader>
              <CardTitle>Waste distribution by type</CardTitle>
            </CardHeader>
            <CardContent className=" mt-10">
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {wasteTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  
                </ResponsiveContainer>
                
                
              </div>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  )
}
