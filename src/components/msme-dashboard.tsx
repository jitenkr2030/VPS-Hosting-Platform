'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Power, 
  PowerOff, 
  RefreshCw, 
  Shield, 
  HardDrive, 
  Activity, 
  MessageCircle, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  IndianRupee,
  HelpCircle,
  FileText
} from 'lucide-react'

export default function MSMEDashboard() {
  const [serverStatus, setServerStatus] = useState('running')
  const [isPerformingAction, setIsPerformingAction] = useState(false)

  const serverInfo = {
    name: 'MSME-Business-Server-01',
    ip: '192.168.1.100',
    plan: 'MSME-VPS Business Server',
    price: '₹999/month',
    nextBilling: '2024-02-15'
  }

  const resources = {
    cpu: 35,
    memory: 62,
    storage: 45,
    bandwidth: 28
  }

  const handleServerAction = async (action: string) => {
    setIsPerformingAction(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    switch (action) {
      case 'start':
        setServerStatus('running')
        break
      case 'stop':
        setServerStatus('stopped')
        break
      case 'restart':
        setServerStatus('running')
        break
    }
    setIsPerformingAction(false)
  }

  const handleBackup = async () => {
    setIsPerformingAction(true)
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsPerformingAction(false)
    alert('Backup completed successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'stopped':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4" />
      case 'stopped':
        return <PowerOff className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getProgressBarColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500'
    if (usage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">MSME Business Dashboard</h1>
              <Badge className={getStatusColor(serverStatus)}>
                {getStatusIcon(serverStatus)}
                <span className="ml-1">{serverStatus.toUpperCase()}</span>
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Server Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Server Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{serverInfo.name}</span>
                  <Badge variant="outline">{serverInfo.plan}</Badge>
                </CardTitle>
                <CardDescription>
                  IP Address: {serverInfo.ip} | Next Billing: {serverInfo.nextBilling}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{serverInfo.price}</div>
                    <div className="text-sm text-gray-600">Monthly Plan</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">99%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Daily</div>
                    <div className="text-sm text-gray-600">Backups</div>
                  </div>
                </div>

                {/* Server Control Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleServerAction('start')}
                    disabled={serverStatus === 'running' || isPerformingAction}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Start Server
                  </Button>
                  <Button
                    onClick={() => handleServerAction('stop')}
                    disabled={serverStatus === 'stopped' || isPerformingAction}
                    variant="destructive"
                  >
                    <PowerOff className="h-4 w-4 mr-2" />
                    Stop Server
                  </Button>
                  <Button
                    onClick={() => handleServerAction('restart')}
                    disabled={isPerformingAction}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPerformingAction ? 'animate-spin' : ''}`} />
                    Restart Server
                  </Button>
                  <Button
                    onClick={handleBackup}
                    disabled={isPerformingAction}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Monitor your server resource consumption
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-600">{resources.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(resources.cpu)}`}
                      style={{ width: `${resources.cpu}%` }}
                    ></div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-600">{resources.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(resources.memory)}`}
                      style={{ width: `${resources.memory}%` }}
                    ></div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-gray-600">{resources.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(resources.storage)}`}
                      style={{ width: `${resources.storage}%` }}
                    ></div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Bandwidth Usage</span>
                    <span className="text-sm text-gray-600">{resources.bandwidth}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(resources.bandwidth)}`}
                      style={{ width: `${resources.bandwidth}%` }}
                    ></div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for your business server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    <span>Security Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <HardDrive className="h-6 w-6 mb-2" />
                    <span>Backup & Restore</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    <span>Performance Logs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Schedule Tasks</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Card */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Get instant support via WhatsApp or call our Indian support team.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Button>
                <Button variant="outline" className="w-full">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Plan</span>
                  <span className="font-semibold">{serverInfo.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Billing Date</span>
                  <span className="font-semibold">{serverInfo.nextBilling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="font-semibold">UPI/Card</span>
                </div>
                <Button variant="outline" className="w-full">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  View Invoices
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Backup completed</span>
                    <span className="text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    <span>Server restarted</span>
                    <span className="text-gray-500 ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>Security updated</span>
                    <span className="text-gray-500 ml-auto">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}