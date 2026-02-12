'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Settings,
  Mail,
  Webhook,
  MessageSquare,
  Terminal
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions: AlertAction[];
}

interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'script';
  config: Record<string, any>;
}

interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  message: string;
  timestamp: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export function AlertManagement() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchAlertRules = async () => {
    try {
      const response = await fetch('/api/monitoring?type=alert-rules');
      if (response.ok) {
        const data = await response.json();
        setAlertRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch alert rules:', error);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAlertRules(), fetchAlerts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateRule = async (ruleData: Omit<AlertRule, 'id'>) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-alert-rule', ...ruleData })
      });
      
      if (response.ok) {
        await fetchAlertRules();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create alert rule:', error);
    }
  };

  const handleUpdateRule = async (rule: AlertRule) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-alert-rule', ...rule })
      });
      
      if (response.ok) {
        await fetchAlertRules();
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Failed to update alert rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;
    
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-alert-rule', id: ruleId })
      });
      
      if (response.ok) {
        await fetchAlertRules();
      }
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'acknowledge-alert', 
          alertId,
          userId: 'current-user' // In real app, get from auth context
        })
      });
      
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', alertId })
      });
      
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'script': return <Terminal className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (loading) {
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
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-muted-foreground">
            Configure alert rules and manage active alerts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
              <DialogDescription>
                Define a new alert rule to monitor system metrics
              </DialogDescription>
            </DialogHeader>
            <AlertRuleForm
              onSubmit={handleCreateRule}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        {/* Alert Rules */}
        <TabsContent value="rules">
          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Condition</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.metric} {rule.operator} {rule.threshold} for {rule.duration}s
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            {getActionIcon(action.type)}
                            <span>{action.type}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {alertRules.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No alert rules configured. Create your first rule to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Active Alerts */}
        <TabsContent value="alerts">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{alert.ruleName}</CardTitle>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started: {new Date(alert.timestamp).toLocaleString()}</span>
                    {alert.acknowledgedAt && (
                      <span>Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</span>
                    )}
                    {alert.resolvedAt && (
                      <span>Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {alerts.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-muted-foreground">
                      No active alerts. All systems are operating normally.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alert Rule</DialogTitle>
            <DialogDescription>
              Modify the alert rule configuration
            </DialogDescription>
          </DialogHeader>
          {editingRule && (
            <AlertRuleForm
              initialData={editingRule}
              onSubmit={(data) => handleUpdateRule({ ...data, id: editingRule.id })}
              onCancel={() => setEditingRule(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AlertRuleFormProps {
  initialData?: AlertRule;
  onSubmit: (data: Omit<AlertRule, 'id'>) => void;
  onCancel: () => void;
}

function AlertRuleForm({ initialData, onSubmit, onCancel }: AlertRuleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    enabled: initialData?.enabled ?? true,
    metric: initialData?.metric || 'cpu.usage',
    operator: initialData?.operator || '>',
    threshold: initialData?.threshold || 80,
    duration: initialData?.duration || 300,
    severity: initialData?.severity || 'warning' as const,
    actions: initialData?.actions || []
  });

  const [newAction, setNewAction] = useState<AlertAction>({
    type: 'email',
    config: { to: '', subject: '' }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
    setNewAction({ type: 'email', config: { to: '', subject: '' } });
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="metric">Metric</Label>
          <Select value={formData.metric} onValueChange={(value) => setFormData(prev => ({ ...prev, metric: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpu.usage">CPU Usage</SelectItem>
              <SelectItem value="memory.usage">Memory Usage</SelectItem>
              <SelectItem value="disk.usage">Disk Usage</SelectItem>
              <SelectItem value="network.bandwidth.incoming">Network In</SelectItem>
              <SelectItem value="network.bandwidth.outgoing">Network Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="operator">Operator</Label>
          <Select value={formData.operator} onValueChange={(value: any) => setFormData(prev => ({ ...prev, operator: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">">{'>'} Greater than</SelectItem>
              <SelectItem value="<">{'<'} Less than</SelectItem>
              <SelectItem value=">=">{'>='} Greater or equal</SelectItem>
              <SelectItem value="<=">{'<='} Less or equal</SelectItem>
              <SelectItem value="=">= Equals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="severity">Severity</Label>
        <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Actions</Label>
        <div className="space-y-2">
          {formData.actions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                {getActionIcon(action.type)}
                <span>{action.type}</span>
                <span className="text-sm text-muted-foreground">
                  {action.type === 'email' ? action.config.to : 
                   action.type === 'webhook' ? action.config.url :
                   action.type === 'slack' ? action.config.channel : action.config.script}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAction(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <div className="grid grid-cols-4 gap-2">
            <Select value={newAction.type} onValueChange={(value: any) => setNewAction(prev => ({ ...prev, type: value, config: {} }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="script">Script</SelectItem>
              </SelectContent>
            </Select>
            
            {newAction.type === 'email' && (
              <>
                <Input
                  placeholder="To: email@example.com"
                  value={newAction.config.to || ''}
                  onChange={(e) => setNewAction(prev => ({ 
                    ...prev, 
                    config: { ...prev.config, to: e.target.value } 
                  }))}
                />
                <Input
                  placeholder="Subject"
                  value={newAction.config.subject || ''}
                  onChange={(e) => setNewAction(prev => ({ 
                    ...prev, 
                    config: { ...prev.config, subject: e.target.value } 
                  }))}
                />
              </>
            )}
            
            {newAction.type === 'webhook' && (
              <Input
                placeholder="Webhook URL"
                className="col-span-3"
                value={newAction.config.url || ''}
                onChange={(e) => setNewAction(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, url: e.target.value } 
                }))}
              />
            )}
            
            {newAction.type === 'slack' && (
              <Input
                placeholder="#channel"
                className="col-span-3"
                value={newAction.config.channel || ''}
                onChange={(e) => setNewAction(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, channel: e.target.value } 
                }))}
              />
            )}
            
            {newAction.type === 'script' && (
              <Input
                placeholder="/path/to/script.sh"
                className="col-span-3"
                value={newAction.config.script || ''}
                onChange={(e) => setNewAction(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, script: e.target.value } 
                }))}
              />
            )}
            
            <Button type="button" onClick={addAction}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Rule
        </Button>
      </div>
    </form>
  );
}