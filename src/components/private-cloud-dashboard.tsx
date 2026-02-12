import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Shield, 
  Users, 
  Activity,
  Power,
  PowerOff,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Lock,
  Key,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  UserCheck,
  UserX,
  Terminal,
  Monitor,
  Wifi,
  Ethernet
} from 'lucide-react';

interface VM {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  os: string;
  cpu: number;
  memory: number;
  storage: number;
  ip: string;
  owner: string;
  created: string;
  uptime?: string;
}

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  vms: {
    total: number;
    running: number;
    stopped: number;
  };
  users: number;
  uptime: string;
}

const PrivateCloudDashboard: React.FC = () => {
  const [vms, setVMs] = useState<VM[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVM, setSelectedVM] = useState<VM | null>(null);

  // Mock data - in real implementation, this would come from API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock VM data
      const mockVMs: VM[] = [
        {
          id: 'vm-001',
          name: 'web-server-01',
          status: 'running',
          os: 'Ubuntu 22.04',
          cpu: 2,
          memory: 4,
          storage: 80,
          ip: '192.168.1.100',
          owner: 'admin',
          created: '2024-01-15',
          uptime: '15 days 3 hours'
        },
        {
          id: 'vm-002',
          name: 'database-01',
          status: 'running',
          os: 'PostgreSQL 14',
          cpu: 4,
          memory: 8,
          storage: 200,
          ip: '192.168.1.101',
          owner: 'admin',
          created: '2024-01-10',
          uptime: '20 days 5 hours'
        },
        {
          id: 'vm-003',
          name: 'dev-environment',
          status: 'stopped',
          os: 'Ubuntu 22.04',
          cpu: 1,
          memory: 2,
          storage: 40,
          ip: '192.168.1.102',
          owner: 'developer',
          created: '2024-01-20'
        },
        {
          id: 'vm-004',
          name: 'monitoring',
          status: 'running',
          os: 'Debian 11',
          cpu: 2,
          memory: 4,
          storage: 60,
          ip: '192.168.1.103',
          owner: 'admin',
          created: '2024-01-08',
          uptime: '27 days 12 hours'
        }
      ];

      // Mock system stats
      const mockStats: SystemStats = {
        cpu: 45,
        memory: 62,
        storage: 38,
        network: 25,
        vms: {
          total: 4,
          running: 3,
          stopped: 1
        },
        users: 12,
        uptime: '45 days 8 hours'
      };

      setVMs(mockVMs);
      setSystemStats(mockStats);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />;
      case 'stopped': return <PowerOff className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const handleVMAction = (vmId: string, action: string) => {
    console.log(`Performing ${action} on VM ${vmId}`);
    // In real implementation, this would call the API
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Private Cloud Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Server className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Private Cloud-in-a-Box</h1>
                  <p className="text-sm text-muted-foreground">Enterprise Infrastructure Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.uptime}</div>
              <p className="text-xs text-muted-foreground">System operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Virtual Machines</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.vms.total}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className="text-green-600">{systemStats?.vms.running} running</span>
                <span>{systemStats?.vms.stopped} stopped</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.users}</div>
              <p className="text-xs text-muted-foreground">Currently logged in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Optimal</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Current system resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemStats?.cpu}%</span>
                </div>
                <Progress value={systemStats?.cpu} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="h-4 w-4" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemStats?.memory}%</span>
                </div>
                <Progress value={systemStats?.memory} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemStats?.storage}%</span>
                </div>
                <Progress value={systemStats?.storage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemStats?.network}%</span>
                </div>
                <Progress value={systemStats?.network} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Services</CardTitle>
              <CardDescription>Status of core system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Virtualization (KVM)', status: 'running', icon: <Server className="h-4 w-4" /> },
                  { name: 'Database (PostgreSQL)', status: 'running', icon: <Database className="h-4 w-4" /> },
                  { name: 'Web Server (Nginx)', status: 'running', icon: <Globe className="h-4 w-4" /> },
                  { name: 'Cache (Redis)', status: 'running', icon: <Zap className="h-4 w-4" /> },
                  { name: 'Firewall (UFW)', status: 'running', icon: <Shield className="h-4 w-4" /> },
                  { name: 'Monitoring (Prometheus)', status: 'running', icon: <BarChart3 className="h-4 w-4" /> }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">{service.icon}</div>
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <Badge variant={service.status === 'running' ? 'default' : 'destructive'}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Virtual Machines Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Virtual Machines</CardTitle>
                <CardDescription>Manage your virtual infrastructure</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create VM
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vms.map((vm) => (
                    <Card key={vm.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{vm.name}</CardTitle>
                          <div className={`flex items-center space-x-1 ${getStatusColor(vm.status)} text-white px-2 py-1 rounded-full text-xs`}>
                            {getStatusIcon(vm.status)}
                            <span className="capitalize">{vm.status}</span>
                          </div>
                        </div>
                        <CardDescription>{vm.os}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Cpu className="h-3 w-3" />
                            <span>{vm.cpu} vCPU</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MemoryStick className="h-3 w-3" />
                            <span>{vm.memory} GB</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <HardDrive className="h-3 w-3" />
                            <span>{vm.storage} GB</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Ethernet className="h-3 w-3" />
                            <span>{vm.ip}</span>
                          </div>
                        </div>
                        
                        {vm.uptime && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Uptime: {vm.uptime}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Owner: {vm.owner}</span>
                          <div className="flex space-x-1">
                            {vm.status === 'running' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVMAction(vm.id, 'stop')}
                              >
                                <PowerOff className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVMAction(vm.id, 'start')}
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVMAction(vm.id, 'console')}
                            >
                              <Terminal className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedVM(vm)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Detailed VM information and configuration</p>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Performance metrics and analytics</p>
                </div>
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                <div className="text-center py-8">
                  <Wifi className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Network configuration and traffic analysis</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivateCloudDashboard;