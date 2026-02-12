import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring/monitoring-service';
import { AuditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.ip || 'unknown';
    const { searchParams } = new URL(request.url);
    
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(clientIP, 'general-api');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const type = searchParams.get('type');
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' | 'month';
    const vmId = searchParams.get('vmId');
    const startTime = searchParams.get('start');
    const endTime = searchParams.get('end');
    const limit = searchParams.get('limit');

    switch (type) {
      case 'system':
        const metrics = await MonitoringService.collectSystemMetrics();
        return NextResponse.json(metrics);

      case 'vm':
        if (!vmId) {
          return NextResponse.json(
            { error: 'VM ID is required for VM metrics' },
            { status: 400 }
          );
        }
        const vmMetrics = await MonitoringService.collectVMMetrics(vmId);
        return NextResponse.json(vmMetrics);

      case 'history':
        const history = await MonitoringService.getMetricsHistory(
          startTime ? new Date(startTime) : undefined,
          endTime ? new Date(endTime) : undefined,
          limit ? parseInt(limit) : undefined
        );
        return NextResponse.json(history);

      case 'vm-history':
        if (!vmId) {
          return NextResponse.json(
            { error: 'VM ID is required for VM history' },
            { status: 400 }
          );
        }
        const vmHistory = await MonitoringService.getVMMetricsHistory(
          vmId,
          startTime ? new Date(startTime) : undefined,
          endTime ? new Date(endTime) : undefined,
          limit ? parseInt(limit) : undefined
        );
        return NextResponse.json(vmHistory);

      case 'analytics':
        if (!period || !['hour', 'day', 'week', 'month'].includes(period)) {
          return NextResponse.json(
            { error: 'Valid period is required (hour, day, week, month)' },
            { status: 400 }
          );
        }
        const analytics = await MonitoringService.getSystemAnalytics(period);
        return NextResponse.json(analytics);

      case 'alerts':
        const alerts = await MonitoringService.getActiveAlerts();
        return NextResponse.json(alerts);

      case 'alert-rules':
        const alertRules = await MonitoringService.getAlertRules();
        return NextResponse.json(alertRules);

      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Monitoring API error:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'MONITORING_API_ERROR',
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || 'unknown';
    
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(clientIP, 'admin-api');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create-alert-rule':
        const alertRule = await MonitoringService.createAlertRule(data);
        await AuditLogger.log({
          ip: clientIP,
          action: 'ALERT_RULE_CREATED',
          severity: 'low',
          details: { ruleId: alertRule.id, ruleName: alertRule.name }
        });
        return NextResponse.json(alertRule);

      case 'update-alert-rule':
        if (!data.id) {
          return NextResponse.json(
            { error: 'Alert rule ID is required' },
            { status: 400 }
          );
        }
        const updatedRule = await MonitoringService.updateAlertRule(data.id, data);
        if (!updatedRule) {
          return NextResponse.json(
            { error: 'Alert rule not found' },
            { status: 404 }
          );
        }
        await AuditLogger.log({
          ip: clientIP,
          action: 'ALERT_RULE_UPDATED',
          severity: 'low',
          details: { ruleId: data.id }
        });
        return NextResponse.json(updatedRule);

      case 'delete-alert-rule':
        if (!data.id) {
          return NextResponse.json(
            { error: 'Alert rule ID is required' },
            { status: 400 }
          );
        }
        const deleted = await MonitoringService.deleteAlertRule(data.id);
        if (!deleted) {
          return NextResponse.json(
            { error: 'Alert rule not found' },
            { status: 404 }
          );
        }
        await AuditLogger.log({
          ip: clientIP,
          action: 'ALERT_RULE_DELETED',
          severity: 'low',
          details: { ruleId: data.id }
        });
        return NextResponse.json({ success: true });

      case 'acknowledge-alert':
        if (!data.alertId || !data.userId) {
          return NextResponse.json(
            { error: 'Alert ID and User ID are required' },
            { status: 400 }
          );
        }
        const acknowledged = await MonitoringService.acknowledgeAlert(data.alertId, data.userId);
        if (!acknowledged) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }
        await AuditLogger.log({
          ip: clientIP,
          action: 'ALERT_ACKNOWLEDGED',
          severity: 'low',
          details: { alertId: data.alertId, userId: data.userId }
        });
        return NextResponse.json({ success: true });

      case 'resolve-alert':
        if (!data.alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required' },
            { status: 400 }
          );
        }
        const resolved = await MonitoringService.resolveAlert(data.alertId);
        if (!resolved) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }
        await AuditLogger.log({
          ip: clientIP,
          action: 'ALERT_RESOLVED',
          severity: 'low',
          details: { alertId: data.alertId }
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Monitoring POST API error:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'MONITORING_API_ERROR',
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}