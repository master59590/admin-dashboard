"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScanEye } from "lucide-react"
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const system = () => {
    const [totalSensor , setTotalSensor] = useState(Number)
    const [errorSensor , setErrorSensor] = useState(Number)
    const [activeSensor , setActiveSensor] = useState(Number)

    useEffect(() => {
        async function fetchUserStats() {
          try {
            const systemCollection = collection(db, "iot_devices")
            
            // Get Error Sensor
            const errorSensorQuery = query(systemCollection, where("status", "==", false))
            const errorSensorSnapshot = await getDocs(errorSensorQuery)
            const errorSensor = errorSensorSnapshot.size
            setErrorSensor(errorSensor)
            
            // Get Active Sensor
            const activeSensorQuery = query(systemCollection, where("status", "==", true))
            const activeSensorSnapshot = await getDocs(activeSensorQuery)
            const activeSensor = activeSensorSnapshot.size
            setActiveSensor(activeSensor)

            // Get total Sensor count
            const systemSnapshot = await getDocs(systemCollection)
            const totalSensor = systemSnapshot.size
            setTotalSensor(totalSensor)
           
          } catch (error) {
            console.error("Error fetching Sensor:", error)
          }
        }
    
        fetchUserStats()
      }, [])
    
  return (
    <div>
        <div className='grid gap-4 md:grid-cols-3'>
            
            <Card className='col-span-1 '>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Sensor</CardTitle>
                <ScanEye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{totalSensor}</div>
                <p className="text-xs text-muted-foreground">Number of Sensors</p>
                </CardContent>
            </Card>
            <Card className='col-span-1 '>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#4ade80]">Sensor Active</CardTitle>
                <ScanEye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{activeSensor}</div>
                <p className="text-xs text-muted-foreground">Number of Sensors Active now</p>
                </CardContent>
            </Card>
            <Card className='col-span-1 '>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#f43f5e]">Sensor Error</CardTitle>
                <ScanEye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{errorSensor}</div>
                <p className="text-xs text-muted-foreground">Number of Sensors Error now</p>
                </CardContent>
            </Card>
            
            
        </div>
    </div>
  )
}

export default system