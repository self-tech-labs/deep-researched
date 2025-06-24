import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { searchResearch } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const provider = searchParams.get('provider');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Fetch all research
    let allResearch;
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      // Use mock data from the research route
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/research`);
      const data = await response.json();
      allResearch = data.researches || [];
    } else {
      allResearch = await db.select().from(researches);
    }

    // Filter by provider if specified
    if (provider) {
      allResearch = allResearch.filter((r: any) => r.provider === provider);
    }

    // Perform search
    const searchResults = searchResearch(query, allResearch);

    // Limit results
    const limitedResults = searchResults.slice(0, limit);

    return NextResponse.json({
      query,
      results: limitedResults.map(r => r.research),
      totalResults: searchResults.length,
      limit,
    });
  } catch (error) {
    console.error('Error searching research:', error);
    return NextResponse.json(
      { error: 'Failed to search research' },
      { status: 500 }
    );
  }
} 