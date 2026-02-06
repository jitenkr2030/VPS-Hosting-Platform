"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Server, Cpu, HardDrive, Wifi, Check } from "lucide-react"

const plans = [
  {
    id: "STARTER",
    name: "Starter",
    price: 499,
    cpu: 1,
    ram: 2,
    storage: 40,
    bandwidth: 2,
    description: "Perfect for small projects"
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: 999,
    cpu: 2,
    ram: 4,
    storage: 80,
    bandwidth: 4,
    description: "Great for growing businesses"
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: 1999,
    cpu: 4,
    ram: 8,
    storage: 160,
    bandwidth: 8,
    description: "For demanding workloads"
  }
]

const operatingSystems = [
  { id: "ubuntu-22.04", name: "Ubuntu 22.04 LTS" },
  { id: "ubuntu-20.04", name: "Ubuntu 20.04 LTS" },
  { id: "debian-11", name: "Debian 11" },
  { id: "centos-8", name: "CentOS 8" },
  { id: "fedora-37", name: "Fedora 37" }
]

export default function CreateVpsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    hostname: "",
    plan: "",
    os: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.name || !formData.hostname || !formData.plan || !formData.os) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/vps/instances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.push("/dashboard?message=VPS created successfully")
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    setSelectedPlan(plan || null)
    setFormData(prev => ({ ...prev, plan: planId }))
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New VPS</h1>
        <p className="text-gray-600 mt-2">Configure and deploy your virtual private server</p>
      </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Set up your VPS basic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">VPS Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My Web Server"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input
                    id="hostname"
                    placeholder="e.g., server.example.com"
                    value={formData.hostname}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostname: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Plan</CardTitle>
              <CardDescription>Choose the plan that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.id === "PROFESSIONAL" && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">₹{plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{plan.cpu} vCPU Cores</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{plan.ram} GB RAM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{plan.storage} GB NVMe SSD</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{plan.bandwidth} TB Bandwidth</span>
                      </div>
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operating System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Operating System</CardTitle>
              <CardDescription>Choose your preferred operating system</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={formData.os} onValueChange={(value) => setFormData(prev => ({ ...prev, os: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an operating system" />
                </SelectTrigger>
                <SelectContent>
                  {operatingSystems.map((os) => (
                    <SelectItem key={os.id} value={os.id}>
                      {os.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? "Creating..." : "Create VPS Instance"}
            </Button>
          </div>
        </form>
    </div>
  )
}