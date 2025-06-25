import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { searchResearch } from '@/lib/search';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(request, 'search');
    if (rateLimitResponse) return rateLimitResponse;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const provider = searchParams.get('provider');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Fetch all research
    let allResearch;
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      // Use mock data from the research route
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/research`);
      if (!response.ok) {
        throw new Error('Failed to fetch research data');
      }
      const data = await response.json();
      allResearch = data.researches || [];
    } else {
      allResearch = await db.select().from(researches);
    }

    // Filter by provider if specified
    if (provider && provider !== 'all') {
      allResearch = allResearch.filter((r: any) => r.provider === provider);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      allResearch = allResearch.filter((r: any) => r.category === category);
    }

    // Perform search
    const searchResults = searchResearch(query.trim(), allResearch);

    // Limit results
    const limitedResults = searchResults.slice(0, Math.max(1, Math.min(100, limit)));

    return NextResponse.json({
      query: query.trim(),
      results: limitedResults.map(r => r.research),
      totalResults: searchResults.length,
      limit,
      filters: {
        provider: provider || null,
        category: category || null,
      },
    });
  } catch (error) {
    console.error('Error searching research:', error);
    return NextResponse.json(
      { error: 'Failed to search research. Please try again.' },
      { status: 500 }
    );
  }
} 