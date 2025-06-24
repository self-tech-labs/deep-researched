import { Research } from './db/schema';

export interface SearchResult {
  research: Research;
  relevanceScore: number;
}

export function searchResearch(query: string, researches: Research[]): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  const results: SearchResult[] = researches.map(research => {
    let score = 0;
    
    // Title matching (highest weight)
    const titleLower = research.title.toLowerCase();
    if (titleLower.includes(queryLower)) {
      score += 10;
    }
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        score += 3;
      }
    });
    
    // Description matching
    if (research.description) {
      const descLower = research.description.toLowerCase();
      if (descLower.includes(queryLower)) {
        score += 5;
      }
      queryWords.forEach(word => {
        if (descLower.includes(word)) {
          score += 2;
        }
      });
    }
    
    // Content matching (lower weight due to size)
    if (research.content) {
      const contentLower = research.content.toLowerCase();
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 1;
        }
      });
    }
    
    // Tag matching
    if (research.tags && Array.isArray(research.tags)) {
      research.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 4;
        }
        queryWords.forEach(word => {
          if (tag.toLowerCase().includes(word)) {
            score += 2;
          }
        });
      });
    }
    
    // Provider bonus if mentioned in query
    if (research.provider && queryLower.includes(research.provider.toLowerCase())) {
      score += 3;
    }
    
    return {
      research,
      relevanceScore: score,
    };
  });
  
  // Filter out zero scores and sort by relevance
  return results
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
} 