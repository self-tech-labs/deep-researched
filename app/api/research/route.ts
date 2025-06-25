import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { scrapeResearchFromUrl, extractKeywords } from '@/lib/scraper';
import { processResearchContent } from '@/lib/anthropic';
import { checkRateLimit } from '@/lib/rate-limit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Mock database for local development
let mockDatabase: any[] = [];

const createResearchSchema = z.object({
  url: z.string().url('Invalid URL format'),
  authorHandle: z.string().optional(),
  authorName: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(request, 'search');
    if (rateLimitResponse) return rateLimitResponse;

    // For local development, return mock data
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      return NextResponse.json({ researches: mockDatabase });
    }

    const allResearch = await db.select().from(researches);
    return NextResponse.json({ researches: allResearch });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit for submissions
    const rateLimitResponse = await checkRateLimit(request, 'submit');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    
    // Validate input
    const validationResult = createResearchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { url, authorHandle, authorName } = validationResult.data;

    // Check if URL already exists
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      const existing = mockDatabase.find(r => r.url === url);
      if (existing) {
        return NextResponse.json(
          { error: 'This research has already been submitted' },
          { status: 409 }
        );
      }
    } else {
      const existing = await db.select().from(researches).where(eq(researches.url, url));
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'This research has already been submitted' },
          { status: 409 }
        );
      }
    }

    // Scrape the research content
    const scrapedData = await scrapeResearchFromUrl(url);
    
    if (!scrapedData) {
      return NextResponse.json(
        { error: 'Failed to scrape research content. Please check the URL and try again.' },
        { status: 400 }
      );
    }

    // Extract keywords for tags (fallback if Anthropic processing fails)
    const fallbackTags = extractKeywords(
      (scrapedData.title || '') + ' ' + (scrapedData.description || '') + ' ' + 
      (scrapedData.content || '').substring(0, 1000)
    );

    // Use AI-enhanced data if available, otherwise fall back to scraped data
    const tags = scrapedData.isProcessed 
      ? scrapedData.metadata?.processedKeywords || fallbackTags 
      : fallbackTags;

    const newResearch = {
      url,
      title: scrapedData.title || 'Untitled Research',
      description: scrapedData.description || '',
      content: scrapedData.content || '',
      summary: scrapedData.summary,
      provider: scrapedData.provider || 'other',
      category: scrapedData.category,
      metadata: {
        ...scrapedData.metadata,
        submittedAt: new Date().toISOString(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
      tags,
      authorHandle: authorHandle || null,
      authorName: authorName || null,
      viewCount: 0,
      isProcessed: scrapedData.isProcessed ? 'processed' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For local development, use mock database
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      const mockEntry = {
        ...newResearch,
        id: mockDatabase.length + 1,
      };
      mockDatabase.push(mockEntry);
      return NextResponse.json({ research: mockEntry }, { status: 201 });
    }

    const [insertedResearch] = await db.insert(researches).values(newResearch).returning();
    
    // If content wasn't processed with Anthropic, queue for background processing
    if (!scrapedData.isProcessed && process.env.ANTHROPIC_API_KEY) {
      // In a real production app, you'd queue this for background processing
      // For now, we'll just log it
      console.log('Research queued for background processing:', insertedResearch.id);
    }
    
    return NextResponse.json({ research: insertedResearch }, { status: 201 });
  } catch (error) {
    console.error('Error creating research:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create research entry' },
      { status: 500 }
    );
  }
} 