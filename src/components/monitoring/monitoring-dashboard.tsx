'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
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
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface MonitoringDashboardProps {
  refreshInterval?: number;
}

export function MonitoringDashboard({ refreshInterval = 30000 }: MonitoringDashboardProps) {
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('hour');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring?type=system');
      if (response.ok) {
        const data = await response.json();
        setSystemMetrics(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

  const fetchAnalytics = async (period: string) => {
    try {
      const response = await fetch(`/api/monitoring?type=analytics&period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/monitoring?type=alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSystemMetrics(),
      fetchAnalytics(selectedPeriod),
      fetchAlerts()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    
    const interval = setInterval(() => {
      fetchSystemMetrics();
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading && !systemMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system metrics and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button onClick={refreshData} disabled={loading}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          <div className="grid gap-2">
            {alerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    <Badge className={`mr-2 ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                    {alert.message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* System Overview */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.cpu.usage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Load: {systemMetrics.cpu.loadAverage[0].toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.memory.usage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.disk.usage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(systemMetrics.network.bandwidth.incoming / 1024 / 1024).toFixed(1)} MB/s
              </div>
              <p className="text-xs text-muted-foreground">
                In: {(systemMetrics.network.bandwidth.incoming / 1024 / 1024).toFixed(1)} MB/s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="hour">Hour</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedPeriod} className="space-y-4">
          {analytics && analytics.timeline ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage Over Time</CardTitle>
                  <CardDescription>
                    CPU, Memory, and Disk usage trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cpu" 
                        stroke="#3b82f6" 
                        name="CPU %"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="memory" 
                        stroke="#10b981" 
                        name="Memory %"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="disk" 
                        stroke="#f59e0b" 
                        name="Disk %"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Analytics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Summary statistics and trends for {selectedPeriod}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.averages.cpu?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg CPU</div>
                      {getTrendIcon(analytics.trends.cpu)}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.averages.memory?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Memory</div>
                      {getTrendIcon(analytics.trends.memory)}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {analytics.averages.disk?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Disk</div>
                      {getTrendIcon(analytics.trends.disk)}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Peak Values</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU Peak:</span>
                        <span className="text-sm font-medium">
                          {analytics.peaks.cpu?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Memory Peak:</span>
                        <span className="text-sm font-medium">
                          {analytics.peaks.memory?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Disk Peak:</span>
                        <span className="text-sm font-medium">
                          {analytics.peaks.disk?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Data Points</h4>
                    <div className="text-2xl font-bold">
                      {analytics.dataPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Samples collected
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No analytics data available for {selectedPeriod}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* System Details */}
      {systemMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Interfaces */}
          <Card>
            <CardHeader>
              <CardTitle>Network Interfaces</CardTitle>
              <CardDescription>
                Network interface status and traffic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.network.interfaces.map((interface: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{interface.name}</h4>
                      <Badge variant={interface.status === 'up' ? 'default' : 'destructive'}>
                        {interface.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span> {interface.type}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Speed:</span> {interface.speed} Mbps
                      </div>
                      <div>
                        <span className="text-muted-foreground">RX:</span> {formatBytes(interface.rx_bytes)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">TX:</span> {formatBytes(interface.tx_bytes)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disk Partitions */}
          <Card>
            <CardHeader>
              <CardTitle>Disk Partitions</CardTitle>
              <CardDescription>
                Disk usage by partition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.disk.partitions.map((partition: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{partition.mountpoint}</h4>
                      <Badge variant={partition.usage > 80 ? 'destructive' : 'default'}>
                        {partition.usage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Device:</span> {partition.device}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Filesystem:</span> {partition.filesystem}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Used:</span> {formatBytes(partition.used)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Free:</span> {formatBytes(partition.free)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            partition.usage > 80 ? 'bg-red-500' : 
                            partition.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${partition.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}