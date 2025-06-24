import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { scrapeResearchFromUrl, extractKeywords } from '@/lib/scraper';
import { eq } from 'drizzle-orm';

// Mock database for local development
let mockDatabase: any[] = [];

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json();
    const { url, authorHandle, authorName } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

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
        { error: 'Failed to scrape research content' },
        { status: 400 }
      );
    }

    // Extract keywords for tags
    const tags = extractKeywords(scrapedData.title + ' ' + scrapedData.description);

    const newResearch = {
      url,
      title: scrapedData.title,
      description: scrapedData.description || '',
      content: scrapedData.content,
      provider: scrapedData.provider,
      metadata: scrapedData.metadata,
      tags,
      authorHandle: authorHandle || null,
      authorName: authorName || null,
      viewCount: 0,
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
    
    return NextResponse.json({ research: insertedResearch }, { status: 201 });
  } catch (error) {
    console.error('Error creating research:', error);
    return NextResponse.json(
      { error: 'Failed to create research entry' },
      { status: 500 }
    );
  }
} 