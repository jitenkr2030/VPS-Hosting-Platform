import { NextRequest, NextResponse } from 'next/server';
import { ComplianceManager } from '@/lib/security/compliance';
import { AuditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.ip || 'unknown';
    const { searchParams } = new URL(request.url);
    
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(clientIP, 'admin-api');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const reportType = searchParams.get('type') as 'GDPR' | 'HIPAA' | 'ISO27001' | 'PCI-DSS';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: type, start, end' },
        { status: 400 }
      );
    }

    const period = {
      start: new Date(startDate),
      end: new Date(endDate)
    };

    let report;
    switch (reportType) {
      case 'GDPR':
        report = await ComplianceManager.generateGDPRReport(period);
        break;
      case 'HIPAA':
        report = await ComplianceManager.generateHIPAAReport(period);
        break;
      case 'ISO27001':
        report = await ComplianceManager.generateISO27001Report(period);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported report type' },
          { status: 400 }
        );
    }

    await AuditLogger.log({
      ip: clientIP,
      action: 'COMPLIANCE_REPORT_GENERATED',
      severity: 'low',
      details: { 
        reportType, 
        period, 
        score: report.score,
        status: report.status
      }
    });

    return NextResponse.json(report);

  } catch (error) {
    console.error('Compliance report error:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'COMPLIANCE_REPORT_ERROR',
      severity: 'high',
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
    const { reportType, period } = body;

    if (!reportType || !period) {
      return NextResponse.json(
        { error: 'Missing required parameters: reportType, period' },
        { status: 400 }
      );
    }

    // Generate all compliance reports
    const reports = await Promise.all([
      ComplianceManager.generateGDPRReport(period),
      ComplianceManager.generateHIPAAReport(period),
      ComplianceManager.generateISO27001Report(period)
    ]);

    const consolidatedReport = {
      id: crypto.randomUUID(),
      reportType: 'CONSOLIDATED',
      generatedAt: new Date(),
      period,
      reports,
      overallScore: Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length),
      summary: {
        totalFindings: reports.reduce((sum, r) => sum + r.findings.length, 0),
        criticalFindings: reports.reduce((sum, r) => 
          sum + r.findings.filter(f => f.severity === 'critical').length, 0),
        highFindings: reports.reduce((sum, r) => 
          sum + r.findings.filter(f => f.severity === 'high').length, 0),
        mediumFindings: reports.reduce((sum, r) => 
          sum + r.findings.filter(f => f.severity === 'medium').length, 0),
        lowFindings: reports.reduce((sum, r) => 
          sum + r.findings.filter(f => f.severity === 'low').length, 0)
      }
    };

    await AuditLogger.log({
      ip: clientIP,
      action: 'CONSOLIDATED_COMPLIANCE_REPORT_GENERATED',
      severity: 'low',
      details: { 
        period, 
        overallScore: consolidatedReport.overallScore,
        totalFindings: consolidatedReport.summary.totalFindings
      }
    });

    return NextResponse.json(consolidatedReport);

  } catch (error) {
    console.error('Consolidated compliance report error:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'CONSOLIDATED_COMPLIANCE_REPORT_ERROR',
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}