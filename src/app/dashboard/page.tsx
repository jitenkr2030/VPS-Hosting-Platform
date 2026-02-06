"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Plus, Power, RefreshCw, Settings, Activity, HardDrive, Cpu, Wifi } from "lucide-react"

interface VpsInstance {
  id: string
  name: string
  hostname: string
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED" | "ERROR"
  plan: "STARTER" | "PROFESSIONAL" | "BUSINESS"
  cpu: number
  ram: number
  storage: number
  bandwidth: number
  price: number
  ipAddresses: string
  os: string
  createdAt: string
  expiresAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vpsInstances, setVpsInstances] = useState<VpsInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchVpsInstances()
    }
  }, [session])

  const fetchVpsInstances = async () => {
    try {
      const response = await fetch("/api/vps/instances")
      if (response.ok) {
        const data = await response.json()
        setVpsInstances(data.instances || [])
      }
    } catch (error) {
      console.error("Failed to fetch VPS instances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-100"
      case "PENDING":
        return "text-yellow-600 bg-yellow-100"
      case "SUSPENDED":
        return "text-orange-600 bg-orange-100"
      case "TERMINATED":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "STARTER":
        return "Starter"
      case "PROFESSIONAL":
        return "Professional"
      case "BUSINESS":
        return "Business"
      default:
        return plan
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your VPS instances</p>
        </div>
        <Link href="/dashboard/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create VPS
          </Button>
        </Link>
      </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total VPS</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vpsInstances.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {vpsInstances.filter(v => v.status === "ACTIVE").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{vpsInstances.reduce((sum, v) => sum + v.price, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vpsInstances.reduce((sum, v) => sum + v.cpu, 0)} vCPUs
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VPS Instances */}
        <Card>
          <CardHeader>
            <CardTitle>Your VPS Instances</CardTitle>
            <CardDescription>
              Manage and monitor your virtual private servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vpsInstances.length === 0 ? (
              <div className="text-center py-12">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No VPS instances</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first VPS instance.</p>
                <Link href="/dashboard/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First VPS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vpsInstances.map((vps) => (
                  <Card key={vps.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{vps.name}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vps.status)}`}>
                          {vps.status}
                        </span>
                      </div>
                      <CardDescription>{vps.hostname}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-gray-500" />
                          <span>{vps.cpu} vCPUs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-4 w-4 text-gray-500" />
                          <span>{vps.ram} GB RAM</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4 text-gray-500" />
                          <span>{vps.storage} GB SSD</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wifi className="h-4 w-4 text-gray-500" />
                          <span>{vps.bandwidth} TB</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">{getPlanName(vps.plan)} Plan</p>
                        <p className="text-gray-600">₹{vps.price}/month</p>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium">IP Address:</p>
                        <p className="text-gray-600">{vps.ipAddresses || "Assigning..."}</p>
                      </div>

                      <div className="flex space-x-2">
                        {vps.status === "ACTIVE" && (
                          <>
                            <Button size="sm" variant="outline">
                              <Power className="h-4 w-4 mr-1" />
                              Power
                            </Button>
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reboot
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}