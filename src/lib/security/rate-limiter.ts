interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

export class RateLimiter {
  private static limits = new Map<string, RateLimitEntry>();
  private static readonly DEFAULT_LIMITS = {
    'auth-api': { requests: 5, window: 90000 },    // 5 requests per 90 seconds
    'general-api': { requests: 100, window: 60000 }, // 100 requests per minute
    'admin-api': { requests: 200, window: 60000 },   // 200 requests per minute
    'login': { requests: 3, window: 300000 },        // 3 login attempts per 5 minutes
    'password-reset': { requests: 3, window: 3600000 } // 3 password resets per hour
  };

  static async checkLimit(
    identifier: string, 
    limitType: keyof typeof RateLimiter.DEFAULT_LIMITS,
    customLimit?: { requests: number; window: number }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const limit = customLimit || this.DEFAULT_LIMITS[limitType];
    const key = `${identifier}:${limitType}`;
    const now = Date.now();
    
    let entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // New window or expired window
      entry = {
        count: 1,
        resetTime: now + limit.window,
        lastRequest: now
      };
      this.limits.set(key, entry);
      
      return {
        allowed: true,
        remaining: limit.requests - 1,
        resetTime: entry.resetTime
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    // Increment counter
    entry.count++;
    entry.lastRequest = now;
    this.limits.set(key, entry);
    
    return {
      allowed: true,
      remaining: limit.requests - entry.count,
      resetTime: entry.resetTime
    };
  }

  static async resetLimit(identifier: string, limitType: string): Promise<void> {
    const key = `${identifier}:${limitType}`;
    this.limits.delete(key);
  }

  static getRemainingRequests(
    identifier: string, 
    limitType: keyof typeof RateLimiter.DEFAULT_LIMITS
  ): number {
    const key = `${identifier}:${limitType}`;
    const entry = this.limits.get(key);
    const limit = this.DEFAULT_LIMITS[limitType];
    
    if (!entry || Date.now() > entry.resetTime) {
      return limit.requests;
    }
    
    return Math.max(0, limit.requests - entry.count);
  }

  // Clean up expired entries periodically
  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => RateLimiter.cleanup(), 300000);