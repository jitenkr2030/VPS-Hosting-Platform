import { NextRequest, NextResponse } from 'next/server';
import { BrandingManager, BrandConfig } from '@/lib/branding/branding-manager';
import { AuditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.ip || 'unknown';
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(clientIP, 'general-api');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const config = await BrandingManager.loadConfig(configId || undefined);
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_ACCESSED',
      severity: 'low',
      details: { configId: config.id }
    });

    return NextResponse.json(config);

  } catch (error) {
    console.error('Error loading brand config:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'BRAND_CONFIG_ERROR',
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Failed to load brand configuration' },
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
    const { action, config } = body;

    switch (action) {
      case 'create':
        return handleCreateConfig(config, clientIP);
      case 'update':
        return handleUpdateConfig(config, clientIP);
      case 'validate':
        return handleValidateConfig(config, clientIP);
      case 'export':
        return handleExportConfig(config, clientIP);
      case 'import':
        return handleImportConfig(config.configJson, clientIP);
      case 'reset':
        return handleResetConfig(clientIP);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in brand config API:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'BRAND_CONFIG_ERROR',
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateConfig(configData: Partial<BrandConfig>, clientIP: string) {
  try {
    const config = await BrandingManager.createCustomConfig(configData);
    await BrandingManager.saveConfig(config);
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_CREATED',
      severity: 'low',
      details: { configId: config.id, companyName: config.company.name }
    });

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create configuration' },
      { status: 400 }
    );
  }
}

async function handleUpdateConfig(configData: BrandConfig, clientIP: string) {
  try {
    await BrandingManager.saveConfig(configData);
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_UPDATED',
      severity: 'low',
      details: { configId: configData.id, companyName: configData.company.name }
    });

    return NextResponse.json({
      success: true,
      config: configData
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update configuration' },
      { status: 400 }
    );
  }
}

async function handleValidateConfig(configData: Partial<BrandConfig>, clientIP: string) {
  const validation = BrandingManager.validateConfig(configData);
  
  await AuditLogger.log({
    ip: clientIP,
    action: 'BRAND_CONFIG_VALIDATED',
    severity: 'low',
    details: { 
      valid: validation.valid, 
      errorCount: validation.errors.length 
    }
  });

  return NextResponse.json({
    valid: validation.valid,
    errors: validation.errors
  });
}

async function handleExportConfig(configData: BrandConfig, clientIP: string) {
  try {
    const exportData = BrandingManager.exportConfig(configData);
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_EXPORTED',
      severity: 'low',
      details: { configId: configData.id }
    });

    return NextResponse.json({
      exportData,
      filename: `brand-config-${configData.company.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export configuration' },
      { status: 500 }
    );
  }
}

async function handleImportConfig(configJson: string, clientIP: string) {
  try {
    const config = BrandingManager.importConfig(configJson);
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_IMPORTED',
      severity: 'low',
      details: { configId: config.id, companyName: config.company.name }
    });

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import configuration' },
      { status: 400 }
    );
  }
}

async function handleResetConfig(clientIP: string) {
  try {
    const config = await BrandingManager.resetToDefault();
    
    await AuditLogger.log({
      ip: clientIP,
      action: 'BRAND_CONFIG_RESET',
      severity: 'medium',
      details: { configId: config.id }
    });

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset configuration' },
      { status: 500 }
    );
  }
}