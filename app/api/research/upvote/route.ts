import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(request, 'upvote');
    if (rateLimitResponse) return rateLimitResponse;

    const { researchId } = await request.json();

    if (!researchId || typeof researchId !== 'number') {
      return NextResponse.json(
        { error: 'Valid research ID is required' },
        { status: 400 }
      );
    }

    // Check if using mock data
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      // For demo purposes with mock data, just return success
      return NextResponse.json({
        success: true,
        message: 'Upvote recorded (demo mode)',
        newUpvoteCount: Math.floor(Math.random() * 50) + 1
      });
    }

    // Update upvote count in database
    const result = await db
      .update(researches)
      .set({ 
        upvotes: sql`${researches.upvotes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(researches.id, researchId))
      .returning({ 
        id: researches.id, 
        upvotes: researches.upvotes 
      });

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Research not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      newUpvoteCount: result[0].upvotes
    });

  } catch (error) {
    console.error('Error upvoting research:', error);
    return NextResponse.json(
      { error: 'Failed to upvote research. Please try again.' },
      { status: 500 }
    );
  }
} 