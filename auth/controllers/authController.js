const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models/User');
const { Session } = require('../models/Session');
const { generateTokens, generateEmailToken, generatePasswordResetToken } = require('../utils/tokenUtils');
const { logger } = require('../utils/logger');
const EmailService = require('../utils/emailService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Generate email verification token
      const emailVerificationToken = generateEmailToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        emailVerificationToken,
        emailVerificationExpires,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      await user.save();

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(email, emailVerificationToken);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.findByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed attempts. Please try again later.'
        });
      }

      // Check if account is active
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active. Please verify your email or contact support.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const tempToken = generateEmailToken();
        user.twoFactorTempToken = tempToken;
        user.twoFactorTempExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Please provide your two-factor authentication code',
          requiresTwoFactor: true,
          tempToken
        });
      }

      // Generate tokens and create session
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      const session = new Session({
        userId: user._id,
        token: accessToken,
        refreshToken,
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          platform: this.getPlatform(req.get('User-Agent')),
          browser: this.getBrowser(req.get('User-Agent')),
          os: this.getOS(req.get('User-Agent'))
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();

      // Update user last login
      user.lastLogin = new Date();
      user.metadata.lastSeen = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Login with 2FA
  async loginWithTwoFactor(req, res) {
    try {
      const { tempToken, twoFactorCode } = req.body;

      // Find user by temp token
      const user = await User.findOne({
        twoFactorTempToken: tempToken,
        twoFactorTempExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired temporary token'
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2 // Allow 2 steps of clock drift
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }

      // Clear temp token
      user.twoFactorTempToken = undefined;
      user.twoFactorTempExpires = undefined;
      await user.save();

      // Generate tokens and create session
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      const session = new Session({
        userId: user._id,
        token: accessToken,
        refreshToken,
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          platform: this.getPlatform(req.get('User-Agent')),
          browser: this.getBrowser(req.get('User-Agent')),
          os: this.getOS(req.get('User-Agent'))
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();

      // Update user last login
      user.lastLogin = new Date();
      user.metadata.lastSeen = new Date();
      await user.save();

      logger.info(`User logged in with 2FA: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('2FA login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during 2FA login'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      await req.session.deactivate();
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Find session by refresh token
      const session = await Session.findActiveByRefreshToken(refreshToken);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.userId._id);

      // Update session
      session.token = accessToken;
      session.refreshToken = newRefreshToken;
      session.lastActivity = new Date();
      await session.save();

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh'
      });
    }
  }

  // Setup 2FA
  async setupTwoFactor(req, res) {
    try {
      const user = req.user;

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Pro VPS Hosting (${user.email})`,
        issuer: 'Pro VPS Hosting'
      });

      // Save secret to user (but don't enable yet)
      user.twoFactorSecret = secret.base32;
      await user.save();

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication setup initiated',
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          backupCodes: this.generateBackupCodes()
        }
      });
    } catch (error) {
      logger.error('2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during 2FA setup'
      });
    }
  }

  // Verify 2FA setup
  async verifyTwoFactorSetup(req, res) {
    try {
      const { verificationCode, backupCodes } = req.body;
      const user = req.user;

      if (!user.twoFactorSecret) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication setup not initiated'
        });
      }

      // Verify the code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: verificationCode,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Enable 2FA and save backup codes
      user.twoFactorEnabled = true;
      user.backupCodes = backupCodes || this.generateBackupCodes();
      await user.save();

      logger.info(`2FA enabled for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    } catch (error) {
      logger.error('2FA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during 2FA verification'
      });
    }
  }

  // Disable 2FA
  async disableTwoFactor(req, res) {
    try {
      const { password, twoFactorCode } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Verify 2FA code if enabled
      if (user.twoFactorEnabled) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2
        });

        if (!verified) {
          return res.status(400).json({
            success: false,
            message: 'Invalid two-factor authentication code'
          });
        }
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.backupCodes = [];
      await user.save();

      logger.info(`2FA disabled for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
      });
    } catch (error) {
      logger.error('2FA disable error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during 2FA disable'
      });
    }
  }

  // Get user sessions
  async getSessions(req, res) {
    try {
      const sessions = await Session.find({ 
        userId: req.user._id, 
        isActive: true 
      }).sort({ lastActivity: -1 });

      res.status(200).json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session._id,
            deviceInfo: session.deviceInfo,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            isCurrentSession: session._id.toString() === req.session._id.toString()
          }))
        }
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching sessions'
      });
    }
  }

  // Revoke session
  async revokeSession(req, res) {
    try {
      const { sessionId } = req.params;

      // Don't allow revoking current session through this endpoint
      if (sessionId === req.session._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot revoke current session. Use logout instead.'
        });
      }

      const session = await Session.findOne({ 
        _id: sessionId, 
        userId: req.user._id 
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      await session.deactivate();

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully'
      });
    } catch (error) {
      logger.error('Revoke session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while revoking session'
      });
    }
  }

  // Revoke all sessions
  async revokeAllSessions(req, res) {
    try {
      await Session.updateMany(
        { 
          userId: req.user._id,
          _id: { $ne: req.session._id }
        },
        { isActive: false }
      );

      res.status(200).json({
        success: true,
        message: 'All other sessions revoked successfully'
      });
    } catch (error) {
      logger.error('Revoke all sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while revoking sessions'
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not
        return res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = generatePasswordResetToken();
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      try {
        await EmailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }

      logger.info(`Password reset requested for: ${email}`);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset request'
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // Reset login attempts
      await user.resetLoginAttempts();

      await user.save();

      logger.info(`Password reset completed for: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset'
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      // Activate user if pending
      if (user.status === 'pending') {
        user.status = 'active';
      }

      await user.save();

      logger.info(`Email verified for: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. Your account is now active.'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during email verification'
      });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new token
      const emailVerificationToken = generateEmailToken();
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(email, emailVerificationToken);
      } catch (emailError) {
        logger.error('Failed to resend verification email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resending verification email'
      });
    }
  }

  // Helper methods
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  getPlatform(userAgent) {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }

  getBrowser(userAgent) {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  getOS(userAgent) {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }
}

module.exports = new AuthController();