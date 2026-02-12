import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { InputValidator } from '@/lib/security/input-validation';
import { EncryptionService } from '@/lib/security/encryption';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(clientIP, 'login');
    
    if (!rateLimitResult.allowed) {
      await AuditLogger.log({
        ip: clientIP,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        severity: 'medium',
        details: { reason: 'Rate limit exceeded' },
        userAgent
      });

      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const sanitizedBody = InputValidator.sanitizeObject(body);
    const validation = InputValidator.validate(sanitizedBody, InputValidator.SCHEMAS.LOGIN);

    if (!validation.valid) {
      await AuditLogger.log({
        ip: clientIP,
        action: AUDIT_ACTIONS.LOGIN_ATTEMPT_INVALID,
        severity: 'low',
        details: { errors: validation.errors },
        userAgent
      });
      
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    // Log login attempt
    await AuditLogger.log({
      ip: clientIP,
      action: AUDIT_ACTIONS.LOGIN_ATTEMPT,
      severity: 'low',
      userId: sanitizedBody.username,
      details: { timestamp: new Date().toISOString() },
      userAgent
    });

    // Authenticate user (mock implementation - integrate with your auth system)
    const authResult = await authenticateUser(sanitizedBody);
    
    if (!authResult.success) {
      await AuditLogger.log({
        ip: clientIP,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        severity: 'medium',
        userId: sanitizedBody.username,
        details: { reason: authResult.reason },
        userAgent
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log successful authentication
    await AuditLogger.log({
      ip: clientIP,
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      severity: 'low',
      userId: authResult.user.id,
      details: { 
        timestamp: new Date().toISOString(),
        sessionId: authResult.sessionId
      },
      userAgent,
      sessionId: authResult.sessionId
    });

    // Encrypt sensitive data in response
    const encryptedUserData = EncryptionService.encrypt(JSON.stringify({
      id: authResult.user.id,
      username: authResult.user.username,
      roles: authResult.user.roles
    }));

    return NextResponse.json({
      success: true,
      user: encryptedUserData,
      sessionId: authResult.sessionId,
      expiresAt: authResult.expiresAt
    });

  } catch (error) {
    console.error('Authentication error:', error);
    await AuditLogger.log({
      ip: request.ip || 'unknown',
      action: 'LOGIN_ERROR',
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function authenticateUser(credentials: any) {
  // This would integrate with your authentication system
  // For now, return a mock implementation for demonstration
  
  // Mock user database
  const users = [
    {
      id: 'admin-1',
      username: 'admin',
      passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd5a7fe5d0d0a8b3c5c', // 'password'
      salt: 'salt123',
      roles: ['admin'],
      mfaEnabled: true
    },
    {
      id: 'user-1',
      username: 'user',
      passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd5a7fe5d0d0a8b3c5c', // 'password'
      salt: 'salt123',
      roles: ['user'],
      mfaEnabled: false
    }
  ];

  const user = users.find(u => u.username === credentials.username);
  
  if (!user) {
    return { success: false, reason: 'User not found' };
  }

  const isValidPassword = EncryptionService.verifyPassword(
    credentials.password, 
    user.passwordHash, 
    user.salt
  );

  if (!isValidPassword) {
    return { success: false, reason: 'Invalid password' };
  }

  // Check MFA if enabled
  if (user.mfaEnabled && !credentials.totpCode) {
    return { success: false, reason: 'MFA required' };
  }

  if (user.mfaEnabled && credentials.totpCode) {
    // Verify TOTP code (mock implementation)
    const isValidTOTP = credentials.totpCode === '123456'; // Mock code
    if (!isValidTOTP) {
      return { success: false, reason: 'Invalid MFA code' };
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      roles: user.roles
    },
    sessionId: 'session-' + EncryptionService.generateSecureToken().substring(0, 16),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}