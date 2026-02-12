interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  ip: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  userAgent?: string;
}

export class AuditLogger {
  private static logs: AuditLogEntry[] = [];
  private static maxLogs = 10000; // Keep last 10k logs in memory

  static async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry
    };

    this.logs.push(logEntry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console for now (in production, this would go to a secure log system)
    console.log(`[AUDIT] ${logEntry.severity.toUpperCase()}: ${logEntry.action}`, {
      userId: logEntry.userId,
      ip: logEntry.ip,
      timestamp: logEntry.timestamp,
      details: logEntry.details
    });

    // In a real implementation, you would also:
    // 1. Send to a SIEM system
    // 2. Write to immutable storage
    // 3. Alert on critical events
    // 4. Backup to secure location
  }

  static async getLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
  }): Promise<AuditLogEntry[]> {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action!));
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = await this.getLogs();
    
    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'User ID', 'IP', 'Action', 'Resource', 'Severity', 'Details'];
      const rows = logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.userId || '',
        log.ip,
        log.action,
        log.resource || '',
        log.severity,
        JSON.stringify(log.details)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(logs, null, 2);
  }
}

// Predefined audit actions for consistency
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_REACTIVATED: 'USER_REACTIVATED',
  
  // System Administration
  SYSTEM_CONFIG_UPDATED: 'SYSTEM_CONFIG_UPDATED',
  SECURITY_POLICY_UPDATED: 'SECURITY_POLICY_UPDATED',
  BACKUP_CREATED: 'BACKUP_CREATED',
  BACKUP_RESTORED: 'BACKUP_RESTORED',
  
  // Data Access
  DATA_EXPORTED: 'DATA_EXPORTED',
  DATA_IMPORTED: 'DATA_IMPORTED',
  SENSITIVE_DATA_ACCESSED: 'SENSITIVE_DATA_ACCESSED',
  
  // Security Events
  SECURITY_BREACH: 'SECURITY_BREACH',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  MALICIOUS_REQUEST: 'MALICIOUS_REQUEST',
  
  // VM Management
  VM_CREATED: 'VM_CREATED',
  VM_UPDATED: 'VM_UPDATED',
  VM_DELETED: 'VM_DELETED',
  VM_STARTED: 'VM_STARTED',
  VM_STOPPED: 'VM_STOPPED',
  VM_CONSOLE_ACCESSED: 'VM_CONSOLE_ACCESSED'
} as const;