export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
    partitions: DiskPartition[];
  };
  network: {
    interfaces: NetworkInterface[];
    bandwidth: {
      incoming: number;
      outgoing: number;
    };
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
  };
  uptime: number;
}

export interface DiskPartition {
  device: string;
  mountpoint: string;
  total: number;
  used: number;
  free: number;
  usage: number;
  filesystem: string;
}

export interface NetworkInterface {
  name: string;
  type: string;
  speed: number;
  mtu: number;
  status: 'up' | 'down';
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
}

export interface VMMetrics {
  vmId: string;
  vmName: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  timestamp: Date;
  resources: {
    cpu: {
      allocated: number;
      used: number;
      usage: number;
    };
    memory: {
      allocated: number;
      used: number;
      usage: number;
    };
    disk: {
      allocated: number;
      used: number;
      iops: {
        read: number;
        write: number;
      };
    };
    network: {
      rx_bytes: number;
      tx_bytes: number;
      rx_packets: number;
      tx_packets: number;
    };
  };
  performance: {
    cpu_time: number;
    disk_io: {
      read_bytes: number;
      write_bytes: number;
      read_ops: number;
      write_ops: number;
    };
    network_io: {
      rx_bytes: number;
      tx_bytes: number;
      rx_packets: number;
      tx_packets: number;
    };
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  duration: number; // seconds
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions: AlertAction[];
  conditions: AlertCondition[];
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'script' | 'slack';
  config: Record<string, any>;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  message: string;
  timestamp: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  metadata: Record<string, any>;
}

export class MonitoringService {
  private static metricsHistory: SystemMetrics[] = [];
  private static vmMetricsHistory: VMMetrics[] = [];
  private static alertRules: AlertRule[] = [];
  private static activeAlerts: Alert[] = [];
  private static maxHistorySize = 1000;

  // System Metrics Collection
  static async collectSystemMetrics(): Promise<SystemMetrics> {
    // Mock implementation - in real system, this would use system libraries
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        loadAverage: [
          Math.random() * 2,
          Math.random() * 2,
          Math.random() * 2
        ]
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        used: Math.random() * 12 * 1024 * 1024 * 1024,
        free: Math.random() * 4 * 1024 * 1024 * 1024,
        cached: Math.random() * 2 * 1024 * 1024 * 1024,
        usage: 0
      },
      disk: {
        total: 500 * 1024 * 1024 * 1024, // 500GB
        used: Math.random() * 400 * 1024 * 1024 * 1024,
        free: Math.random() * 100 * 1024 * 1024 * 1024,
        usage: 0,
        partitions: [
          {
            device: '/dev/sda1',
            mountpoint: '/',
            total: 500 * 1024 * 1024 * 1024,
            used: Math.random() * 400 * 1024 * 1024 * 1024,
            free: Math.random() * 100 * 1024 * 1024 * 1024,
            usage: 0,
            filesystem: 'ext4'
          }
        ]
      },
      network: {
        interfaces: [
          {
            name: 'eth0',
            type: 'ethernet',
            speed: 1000,
            mtu: 1500,
            status: 'up',
            rx_bytes: Math.random() * 1000000000,
            tx_bytes: Math.random() * 1000000000,
            rx_packets: Math.random() * 1000000,
            tx_packets: Math.random() * 1000000
          }
        ],
        bandwidth: {
          incoming: Math.random() * 1000000, // 1MB/s
          outgoing: Math.random() * 1000000
        }
      },
      processes: {
        total: Math.floor(Math.random() * 200) + 100,
        running: Math.floor(Math.random() * 10) + 1,
        sleeping: Math.floor(Math.random() * 150) + 50
      },
      uptime: Math.random() * 86400 * 30 // Up to 30 days
    };

    // Calculate usage percentages
    metrics.memory.usage = (metrics.memory.used / metrics.memory.total) * 100;
    metrics.disk.usage = (metrics.disk.used / metrics.disk.total) * 100;
    metrics.disk.partitions.forEach(partition => {
      partition.usage = (partition.used / partition.total) * 100;
    });

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }

    // Check alert rules
    await this.checkAlertRules(metrics);

    return metrics;
  }

  // VM Metrics Collection
  static async collectVMMetrics(vmId: string): Promise<VMMetrics> {
    // Mock implementation
    const metrics: VMMetrics = {
      vmId,
      vmName: `VM-${vmId}`,
      status: 'running',
      timestamp: new Date(),
      resources: {
        cpu: {
          allocated: 2,
          used: Math.random() * 2,
          usage: Math.random() * 100
        },
        memory: {
          allocated: 4 * 1024 * 1024 * 1024, // 4GB
          used: Math.random() * 4 * 1024 * 1024 * 1024,
          usage: Math.random() * 100
        },
        disk: {
          allocated: 50 * 1024 * 1024 * 1024, // 50GB
          used: Math.random() * 50 * 1024 * 1024 * 1024,
          iops: {
            read: Math.random() * 1000,
            write: Math.random() * 1000
          }
        },
        network: {
          rx_bytes: Math.random() * 100000000,
          tx_bytes: Math.random() * 100000000,
          rx_packets: Math.random() * 100000,
          tx_packets: Math.random() * 100000
        }
      },
      performance: {
        cpu_time: Math.random() * 1000000,
        disk_io: {
          read_bytes: Math.random() * 1000000,
          write_bytes: Math.random() * 1000000,
          read_ops: Math.random() * 1000,
          write_ops: Math.random() * 1000
        },
        network_io: {
          rx_bytes: Math.random() * 1000000,
          tx_bytes: Math.random() * 1000000,
          rx_packets: Math.random() * 1000,
          tx_packets: Math.random() * 1000
        }
      }
    };

    this.vmMetricsHistory.push(metrics);
    if (this.vmMetricsHistory.length > this.maxHistorySize) {
      this.vmMetricsHistory = this.vmMetricsHistory.slice(-this.maxHistorySize);
    }

    return metrics;
  }

  // Alert Management
  static async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: crypto.randomUUID()
    };

    this.alertRules.push(newRule);
    return newRule;
  }

  static async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const index = this.alertRules.findIndex(rule => rule.id === id);
    if (index === -1) return null;

    this.alertRules[index] = { ...this.alertRules[index], ...updates };
    return this.alertRules[index];
  }

  static async deleteAlertRule(id: string): Promise<boolean> {
    const index = this.alertRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;

    this.alertRules.splice(index, 1);
    return true;
  }

  static async getAlertRules(): Promise<AlertRule[]> {
    return [...this.alertRules];
  }

  static async getActiveAlerts(): Promise<Alert[]> {
    return [...this.activeAlerts.filter(alert => alert.status === 'active')];
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;
    return true;
  }

  static async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    return true;
  }

  private static async checkAlertRules(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules.filter(r => r.enabled)) {
      const value = this.getMetricValue(metrics, rule.metric);
      if (value === null) continue;

      const triggered = this.evaluateCondition(value, rule.operator, rule.threshold);
      
      if (triggered) {
        // Check if alert already exists
        const existingAlert = this.activeAlerts.find(
          alert => alert.ruleId === rule.id && alert.status === 'active'
        );

        if (!existingAlert) {
          const alert: Alert = {
            id: crypto.randomUUID(),
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            status: 'active',
            message: `${rule.name}: ${rule.metric} ${rule.operator} ${rule.threshold} (current: ${value.toFixed(2)})`,
            timestamp: new Date(),
            metadata: {
              metric: rule.metric,
              value,
              threshold: rule.threshold
            }
          };

          this.activeAlerts.push(alert);
          await this.executeAlertActions(alert, rule);
        }
      }
    }
  }

  private static getMetricValue(metrics: SystemMetrics, metricPath: string): number | null {
    const paths = metricPath.split('.');
    let value: any = metrics;

    for (const path of paths) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return null;
      }
    }

    return typeof value === 'number' ? value : null;
  }

  private static evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '=': return Math.abs(value - threshold) < 0.001;
      default: return false;
    }
  }

  private static async executeAlertActions(alert: Alert, rule: AlertRule): Promise<void> {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'email':
            await this.sendEmailAlert(alert, action.config);
            break;
          case 'webhook':
            await this.sendWebhookAlert(alert, action.config);
            break;
          case 'slack':
            await this.sendSlackAlert(alert, action.config);
            break;
          case 'script':
            await this.executeScriptAlert(alert, action.config);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute alert action ${action.type}:`, error);
      }
    }
  }

  private static async sendEmailAlert(alert: Alert, config: any): Promise<void> {
    // Mock email implementation
    console.log(`Email alert sent to ${config.to}: ${alert.message}`);
  }

  private static async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    // Mock webhook implementation
    console.log(`Webhook alert sent to ${config.url}: ${alert.message}`);
  }

  private static async sendSlackAlert(alert: Alert, config: any): Promise<void> {
    // Mock Slack implementation
    console.log(`Slack alert sent to ${config.channel}: ${alert.message}`);
  }

  private static async executeScriptAlert(alert: Alert, config: any): Promise<void> {
    // Mock script execution
    console.log(`Script alert executed: ${config.script} with message: ${alert.message}`);
  }

  // Data Retrieval
  static async getMetricsHistory(
    startTime?: Date,
    endTime?: Date,
    limit?: number
  ): Promise<SystemMetrics[]> {
    let history = [...this.metricsHistory];

    if (startTime) {
      history = history.filter(m => m.timestamp >= startTime);
    }
    if (endTime) {
      history = history.filter(m => m.timestamp <= endTime);
    }

    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  static async getVMMetricsHistory(
    vmId: string,
    startTime?: Date,
    endTime?: Date,
    limit?: number
  ): Promise<VMMetrics[]> {
    let history = this.vmMetricsHistory.filter(m => m.vmId === vmId);

    if (startTime) {
      history = history.filter(m => m.timestamp >= startTime);
    }
    if (endTime) {
      history = history.filter(m => m.timestamp <= endTime);
    }

    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  // Analytics
  static async getSystemAnalytics(period: 'hour' | 'day' | 'week' | 'month'): Promise<any> {
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const history = await this.getMetricsHistory(startTime, now);

    if (history.length === 0) {
      return {
        period,
        dataPoints: 0,
        averages: {},
        peaks: {},
        trends: {}
      };
    }

    // Calculate analytics
    const cpuValues = history.map(m => m.cpu.usage);
    const memoryValues = history.map(m => m.memory.usage);
    const diskValues = history.map(m => m.disk.usage);

    return {
      period,
      dataPoints: history.length,
      averages: {
        cpu: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
        memory: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
        disk: diskValues.reduce((a, b) => a + b, 0) / diskValues.length
      },
      peaks: {
        cpu: Math.max(...cpuValues),
        memory: Math.max(...memoryValues),
        disk: Math.max(...diskValues)
      },
      trends: {
        cpu: this.calculateTrend(cpuValues),
        memory: this.calculateTrend(memoryValues),
        disk: this.calculateTrend(diskValues)
      },
      timeline: history.map(m => ({
        timestamp: m.timestamp,
        cpu: m.cpu.usage,
        memory: m.memory.usage,
        disk: m.disk.usage
      }))
    };
  }

  private static calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = 5; // 5% threshold

    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }
}