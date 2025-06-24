import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedResearch {
  title: string;
  content: string;
  provider: string;
  description?: string;
  metadata?: Record<string, any>;
}

export async function scrapeResearchFromUrl(url: string): Promise<ScrapedResearch | null> {
  try {
    // Detect provider from URL
    const provider = detectProvider(url);
    
    // For now, we'll do basic HTML scraping
    // In production, you'd want to use provider-specific APIs or methods
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeepResearchBot/1.0)',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Extract basic content - this is simplified and would need provider-specific logic
    const title = $('title').text() || 'Untitled Research';
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Try to extract main content
    let content = '';
    
    // Common selectors for main content
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '#content',
      '.conversation',
      '.chat-messages',
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }
    
    // If no content found, get body text
    if (!content) {
      content = $('body').text().trim();
    }
    
    return {
      title: cleanText(title),
      content: cleanText(content),
      provider,
      description: cleanText(description),
      metadata: {
        scrapedAt: new Date().toISOString(),
        originalUrl: url,
      },
    };
  } catch (error) {
    console.error('Error scraping URL:', error);
    return null;
  }
}

function detectProvider(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('claude.ai')) return 'claude';
  if (hostname.includes('chat.openai.com')) return 'chatgpt';
  if (hostname.includes('gemini.google.com')) return 'gemini';
  if (hostname.includes('grok.x.ai') || hostname.includes('x.com')) return 'grok';
  if (hostname.includes('perplexity.ai')) return 'perplexity';
  
  return 'other';
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 10000); // Limit length
}

export function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP library
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'is', 'are', 'was', 'were', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'shall', 'can', 'need', 'ought'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequency
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  // Sort by frequency and return top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
} 