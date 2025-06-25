import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

const rateLimiters = {
  search: new RateLimiterMemory({
    points: 60, // Number of requests
    duration: 60, // Per 60 seconds (1 minute)
  }),
  submit: new RateLimiterMemory({
    points: 10, // Number of requests
    duration: 3600, // Per 3600 seconds (1 hour)
  }),
};

export async function checkRateLimit(
  request: NextRequest,
  type: 'search' | 'submit'
): Promise<NextResponse | null> {
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    await rateLimiters[type].consume(ip);
    return null; // No rate limit hit
  } catch (rateLimiterRes: any) {
    const remainingPoints = rateLimiterRes?.remainingPoints || 0;
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(msBeforeNext / 1000),
        remainingPoints,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(msBeforeNext / 1000).toString(),
        },
      }
    );
  }
} 