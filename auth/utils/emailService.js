const nodemailer = require('nodemailer');
const { logger } = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Thank you for signing up for Pro VPS Hosting! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't create an account with Pro VPS Hosting, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(email, 'Verify Your Pro VPS Hosting Account', html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested to reset your password for your Pro VPS Hosting account. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(email, 'Reset Your Pro VPS Hosting Password', html);
  }

  async sendTwoFactorEmail(email, code) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Two-Factor Authentication Code</h2>
        <p>Your two-factor authentication code for Pro VPS Hosting is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; display: inline-block;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #333;">${code}</span>
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please secure your account immediately.</p>
      </div>
    `;

    return this.sendEmail(email, 'Your Pro VPS Hosting 2FA Code', html);
  }

  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}

module.exports = new EmailService();