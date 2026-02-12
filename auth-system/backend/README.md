# VPS Platform Authentication System

## Overview

A robust, secure authentication system for the VPS hosting platform with advanced features including JWT authentication, two-factor authentication, email verification, password reset, and comprehensive user management.

## Features

### 🔐 Authentication & Security
- **JWT-based authentication** with configurable expiration
- **Two-Factor Authentication (2FA)** using TOTP
- **Email verification** for new accounts
- **Password reset** functionality with secure tokens
- **Account locking** after failed login attempts
- **Rate limiting** to prevent brute force attacks
- **Password strength validation** with complex requirements

### 👥 User Management
- **Role-based access control** (user, admin, superadmin)
- **User profile management** with preferences
- **Account activation/deactivation** by admins
- **Subscription tracking** integration
- **Comprehensive user search** and filtering

### 🛡️ Security Features
- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Input validation** and sanitization
- **Secure password hashing** with bcrypt
- **JWT token** verification and refresh
- **Audit logging** with Winston

### 📧 Email Integration
- **Nodemailer** for transactional emails
- **Email templates** for verification and password reset
- **Configurable SMTP** settings
- **Email delivery** tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Complete password reset

### Two-Factor Authentication
- `POST /api/auth/enable-2fa` - Enable 2FA
- `POST /api/auth/verify-2fa` - Verify and enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA

### User Profile
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Admin Functions
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/:userId/status` - Update user status (admin only)

### System
- `GET /api/health` - Health check

## Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- NPM or Yarn

### Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Environment variables:**
Create a `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/vps-platform-auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="VPS Platform" <noreply@vpsplatform.in>
```

3. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 8 chars),
  role: String (enum: ['user', 'admin', 'superadmin'], default: 'user'),
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  isTwoFactorEnabled: Boolean (default: false),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  profile: {
    phone: String,
    company: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  preferences: {
    emailNotifications: Boolean (default: true),
    twoFactorReminder: Boolean (default: true),
    language: String (default: 'en')
  },
  subscription: {
    plan: String (enum: ['starter', 'professional', 'business']),
    status: String (enum: ['trial', 'active', 'suspended', 'cancelled']),
    trialEndsAt: Date,
    subscriptionId: String
  }
}
```

## Security Implementation

### Password Security
- **Minimum 8 characters** with complexity requirements
- **At least one lowercase, one uppercase, and one number**
- **bcrypt hashing** with salt rounds
- **Password change** requires current password verification

### Two-Factor Authentication
- **TOTP-based** using speakeasy
- **QR code generation** for easy setup
- **Backup codes** for account recovery
- **Optional but recommended** for enhanced security

### Account Protection
- **Account locking** after 5 failed attempts (2 hours)
- **Email verification** required for new accounts
- **Secure password reset** tokens (1 hour expiry)
- **Rate limiting** on all endpoints

### JWT Security
- **Secure secret key** storage
- **Configurable token expiration**
- **Token-based** stateless authentication
- **Role-based** access control

## API Usage Examples

### Register User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login User
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "twoFactorCode": "123456" // Required if 2FA enabled
}
```

### Enable 2FA
```javascript
POST /api/auth/enable-2fa
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

## Error Handling

### Standard Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if any
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account temporarily locked)
- `500` - Internal Server Error

## Logging

The system uses Winston for comprehensive logging:

### Log Levels
- **info** - Successful operations, user actions
- **error** - Failed operations, system errors
- **warn** - Security events, unusual activity

### Log Events
- User registration and login
- Password changes and resets
- 2FA enable/disable
- Admin actions
- Security events (failed logins, account locks)

## Integration with VPS Platform

### Subscription Management
The auth system integrates with the VPS hosting platform through the `subscription` field in the user model:

```javascript
subscription: {
  plan: 'starter', // 'starter', 'professional', 'business'
  status: 'trial',   // 'trial', 'active', 'suspended', 'cancelled'
  trialEndsAt: Date,
  subscriptionId: String // Payment processor subscription ID
}
```

### User Roles
- **user**: Regular VPS customers
- **admin**: VPS platform administrators
- **superadmin**: System administrators with full access

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Authentication flows
- 2FA functionality
- Password reset
- Profile management
- Admin functions
- Security validations

## Production Deployment

### Environment Setup
1. Set strong JWT secret
2. Configure secure MongoDB connection
3. Set up SMTP for emails
4. Enable HTTPS
5. Configure rate limiting
6. Set up monitoring and logging

### Security Checklist
- [ ] Strong JWT secret key
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Email templates reviewed
- [ ] Password policies enforced
- [ ] 2FA recommended for admins
- [ ] Audit logging enabled
- [ ] Backup strategy in place

## Support

For issues and questions:
1. Check the logs for error details
2. Verify environment configuration
3. Review API documentation
4. Check MongoDB connection
5. Validate email configuration

## License

MIT License - see LICENSE file for details.