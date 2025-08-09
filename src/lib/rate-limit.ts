import { NextRequest } from 'next/server'

interface TokenBucket {
  tokens: number
  lastRefill: number
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map()
  private readonly maxTokens: number
  private readonly refillRate: number // tokens per second
  private readonly cleanupInterval: number = 60000 // 1 minute
  private lastCleanup: number = Date.now()

  constructor(maxTokens = 10, refillRate = 1) {
    this.maxTokens = maxTokens
    this.refillRate = refillRate
  }

  private cleanup() {
    const now = Date.now()
    if (now - this.lastCleanup > this.cleanupInterval) {
      // Remove old buckets that haven't been accessed in 5 minutes
      const cutoff = now - 300000
      for (const [key, bucket] of this.buckets.entries()) {
        if (bucket.lastRefill < cutoff) {
          this.buckets.delete(key)
        }
      }
      this.lastCleanup = now
    }
  }

  private getBucket(key: string): TokenBucket {
    const now = Date.now()
    let bucket = this.buckets.get(key)

    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: now,
      }
      this.buckets.set(key, bucket)
    } else {
      // Refill tokens based on time elapsed
      const timePassed = (now - bucket.lastRefill) / 1000
      const tokensToAdd = timePassed * this.refillRate
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }

    return bucket
  }

  consume(key: string, tokens = 1): boolean {
    this.cleanup()
    const bucket = this.getBucket(key)

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens
      return true
    }

    return false
  }

  getTokensRemaining(key: string): number {
    const bucket = this.getBucket(key)
    return Math.floor(bucket.tokens)
  }
}

// Create rate limiters for different scopes
const ipLimiter = new RateLimiter(30, 0.5) // 30 requests, refill 0.5/sec
const userLimiter = new RateLimiter(100, 2) // 100 requests, refill 2/sec

export function getClientIp(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default for local development
  return '127.0.0.1'
}

export function getUserId(request: NextRequest): string | null {
  // In a real app, extract from JWT or session
  // For now, use a header or cookie
  return request.headers.get('x-user-id') || null
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  retryAfter?: number
}

export function checkRateLimit(request: NextRequest): RateLimitResult {
  const ip = getClientIp(request)
  const userId = getUserId(request)

  // Check IP-based rate limit
  const ipAllowed = ipLimiter.consume(ip)
  const ipRemaining = ipLimiter.getTokensRemaining(ip)

  if (!ipAllowed) {
    return {
      allowed: false,
      limit: 30,
      remaining: 0,
      retryAfter: 2, // seconds
    }
  }

  // If user is authenticated, also check user-based rate limit
  if (userId) {
    const userAllowed = userLimiter.consume(userId)
    const userRemaining = userLimiter.getTokensRemaining(userId)

    if (!userAllowed) {
      return {
        allowed: false,
        limit: 100,
        remaining: 0,
        retryAfter: 1,
      }
    }

    return {
      allowed: true,
      limit: 100,
      remaining: Math.min(ipRemaining, userRemaining),
    }
  }

  return {
    allowed: true,
    limit: 30,
    remaining: ipRemaining,
  }
}

export function rateLimitMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const result = checkRateLimit(request)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': result.retryAfter?.toString() || '60',
          },
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(request, ...args)
    
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    }

    return response
  }
}