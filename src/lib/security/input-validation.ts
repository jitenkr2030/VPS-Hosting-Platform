interface ValidationRule {
  required?: boolean;
  type: 'string' | 'number' | 'email' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

export class InputValidator {
  static validate(data: any, schema: ValidationSchema): { 
    valid: boolean; 
    errors: Record<string, string[]> 
  } {
    const errors: Record<string, string[]> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rule.type && !this.validateType(value, rule.type)) {
        fieldErrors.push(`${field} must be of type ${rule.type}`);
        continue;
      }

      // String validations
      if (rule.type === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(`${field} format is invalid`);
        }
        if (rule.enum && !rule.enum.includes(value)) {
          fieldErrors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
        }
      }

      // Number validations
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          fieldErrors.push(`${field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          fieldErrors.push(`${field} must not exceed ${rule.max}`);
        }
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          fieldErrors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'email':
        return typeof value === 'string' && this.isValidEmail(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize input to prevent XSS
  static sanitize(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate and sanitize object
  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Common validation schemas
  static readonly SCHEMAS = {
    LOGIN: {
      username: { 
        required: true, 
        type: 'string', 
        minLength: 3, 
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/
      },
      password: { 
        required: true, 
        type: 'string', 
        minLength: 8, 
        maxLength: 128 
      },
      totpCode: { 
        required: false, 
        type: 'string', 
        length: 6,
        pattern: /^\d{6}$/
      }
    },
    USER_CREATE: {
      username: { 
        required: true, 
        type: 'string', 
        minLength: 3, 
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/
      },
      email: { 
        required: true, 
        type: 'email' 
      },
      password: { 
        required: true, 
        type: 'string', 
        minLength: 8, 
        maxLength: 128,
        custom: (value: string) => {
          // At least one uppercase, one lowercase, one number, and one special character
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
          return strongPasswordRegex.test(value) || 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
      },
      role: { 
        required: true, 
        type: 'string',
        enum: ['admin', 'user', 'operator', 'viewer']
      }
    },
    VM_CREATE: {
      name: { 
        required: true, 
        type: 'string', 
        minLength: 1, 
        maxLength: 100,
        pattern: /^[a-zA-Z0-9_-]+$/
      },
      cpu: { 
        required: true, 
        type: 'number', 
        min: 1, 
        max: 32 
      },
      memory: { 
        required: true, 
        type: 'number', 
        min: 512, 
        max: 131072 
      },
      storage: { 
        required: true, 
        type: 'number', 
        min: 10, 
        max: 10240 
      },
      template: { 
        required: true, 
        type: 'string' 
      }
    }
  } as const;
}