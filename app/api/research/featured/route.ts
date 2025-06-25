import { NextRequest, NextResponse } from 'next/server';
import { db, researches } from '@/lib/db';
import { desc, sql } from 'drizzle-orm';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(request, 'featured');
    if (rateLimitResponse) return rateLimitResponse;

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6');

    // Mock data for demo purposes
    const mockFeaturedResearch = [
      {
        id: 1,
        title: "Understanding Large Language Models: A Comprehensive Analysis",
        description: "Deep dive into the architecture and capabilities of modern LLMs",
        url: "https://example.com/llm-analysis",
        provider: "claude",
        category: "AI Research",
        tags: ["AI", "LLM", "Machine Learning"],
        authorName: "Dr. Sarah Chen",
        upvotes: 42,
        viewCount: 1250,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isProcessed: "processed"
      },
      {
        id: 2,
        title: "The Future of Human-AI Collaboration",
        description: "Exploring how AI and humans can work together more effectively",
        url: "https://example.com/human-ai-collab",
        provider: "chatgpt",
        category: "Technology",
        tags: ["Collaboration", "Future", "Workplace"],
        authorName: "Alex Rivera",
        upvotes: 38,
        viewCount: 980,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        isProcessed: "processed"
      },
      {
        id: 3,
        title: "Quantum Computing and AI: Synergies and Challenges",
        description: "How quantum computing might accelerate AI development",
        url: "https://example.com/quantum-ai",
        provider: "gemini",
        category: "Technology",
        tags: ["Quantum", "Computing", "AI"],
        authorName: "Prof. Michael Thompson",
        upvotes: 35,
        viewCount: 750,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        isProcessed: "processed"
      },
      {
        id: 4,
        title: "Ethical Considerations in AI Development",
        description: "Addressing bias, fairness, and responsible AI practices",
        url: "https://example.com/ai-ethics",
        provider: "claude",
        category: "Ethics",
        tags: ["Ethics", "Bias", "Responsible AI"],
        authorName: "Dr. Emily Watson",
        upvotes: 31,
        viewCount: 890,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        isProcessed: "processed"
      },
      {
        id: 5,
        title: "Natural Language Processing Breakthroughs",
        description: "Recent advances in understanding and generating human language",
        url: "https://example.com/nlp-breakthroughs",
        provider: "grok",
        category: "AI Research",
        tags: ["NLP", "Language", "Breakthroughs"],
        authorName: "Dr. James Liu",
        upvotes: 28,
        viewCount: 650,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        isProcessed: "processed"
      },
      {
        id: 6,
        title: "AI in Healthcare: Transforming Patient Care",
        description: "How artificial intelligence is revolutionizing medical diagnosis and treatment",
        url: "https://example.com/ai-healthcare",
        provider: "perplexity",
        category: "Healthcare",
        tags: ["Healthcare", "Medicine", "Diagnosis"],
        authorName: "Dr. Maria Rodriguez",
        upvotes: 25,
        viewCount: 720,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        isProcessed: "processed"
      }
    ];

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock')) {
      // Return mock data
      const recentResearch = mockFeaturedResearch.slice(0, 3);
      const popularResearch = [...mockFeaturedResearch]
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);

      return NextResponse.json({
        recent: recentResearch,
        popular: popularResearch
      });
    }

    // Fetch recent research (last 30 days, ordered by creation date)
    const recentResearch = await db
      .select()
      .from(researches)
      .where(sql`${researches.createdAt} >= NOW() - INTERVAL '30 days'`)
      .orderBy(desc(researches.createdAt))
      .limit(Math.max(1, Math.min(10, limit)));

    // Fetch popular research (ordered by upvotes, then view count)
    const popularResearch = await db
      .select()
      .from(researches)
      .orderBy(desc(researches.upvotes), desc(researches.viewCount))
      .limit(Math.max(1, Math.min(10, limit)));

    return NextResponse.json({
      recent: recentResearch,
      popular: popularResearch
    });

  } catch (error) {
    console.error('Error fetching featured research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured research' },
      { status: 500 }
    );
  }
} 