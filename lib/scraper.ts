import axios from 'axios';
import * as cheerio from 'cheerio';
import { processResearchContent, ProcessedContent } from './anthropic';

export interface ScrapedResearch {
  title: string;
  content: string;
  provider: string;
  description?: string;
  summary?: string;
  category?: string;
  metadata?: Record<string, any>;
  isProcessed?: boolean;
}

export async function scrapeResearchFromUrl(url: string): Promise<ScrapedResearch | null> {
  try {
    // Detect provider from URL
    const provider = detectProvider(url);
    
    // Enhanced headers for better scraping
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeepResearchBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 30000, // 30 second timeout
    });

    const $ = cheerio.load(response.data);
    
    // Provider-specific extraction
    let extractedData = extractByProvider($, provider);
    
    // Fallback to generic extraction if provider-specific fails
    if (!extractedData.content || extractedData.content.length < 100) {
      extractedData = extractGeneric($);
    }
    
    // Use Anthropic to process and enhance the content
    let processedContent: ProcessedContent | null = null;
    let isProcessed = false;
    
    if (extractedData.content && extractedData.content.length > 50) {
      processedContent = await processResearchContent(extractedData.content, url);
      isProcessed = !!processedContent;
    }
    
    return {
      title: processedContent?.title || extractedData.title || 'Untitled Research',
      content: extractedData.content,
      provider,
      description: processedContent?.description || extractedData.description || '',
      summary: processedContent?.summary,
      category: processedContent?.category,
      isProcessed,
      metadata: {
        scrapedAt: new Date().toISOString(),
        originalUrl: url,
        contentLength: extractedData.content.length,
        processingUsed: isProcessed,
        ...extractedData.metadata,
      },
    };
  } catch (error) {
    console.error('Error scraping URL:', error);
    return null;
  }
}

function extractByProvider($: cheerio.Root, provider: string) {
  switch (provider) {
    case 'claude':
      return extractClaude($);
    case 'chatgpt':
      return extractChatGPT($);
    case 'gemini':
      return extractGemini($);
    case 'grok':
      return extractGrok($);
    case 'perplexity':
      return extractPerplexity($);
    default:
      return extractGeneric($);
  }
}

function extractClaude($: cheerio.Root) {
  const title = $('title').text() || 'Claude Conversation';
  const description = $('meta[name="description"]').attr('content') || '';
  
  // Try to find conversation content
  let content = '';
  const selectors = [
    '[data-testid="conversation"]',
    '.conversation',
    '[role="main"]',
    'main',
  ];
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'claude' },
  };
}

function extractChatGPT($: cheerio.Root) {
  const title = $('title').text() || 'ChatGPT Conversation';
  const description = $('meta[name="description"]').attr('content') || '';
  
  let content = '';
  const selectors = [
    '[data-testid="conversation-turn"]',
    '.conversation-turn',
    '[role="presentation"]',
    'main',
  ];
  
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      content = elements.map((_, el) => $(el).text()).get().join('\n\n');
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'chatgpt' },
  };
}

function extractGemini($: cheerio.Root) {
  const title = $('title').text() || 'Gemini Conversation';
  const description = $('meta[name="description"]').attr('content') || '';
  
  let content = '';
  const selectors = [
    '[data-test-id="conversation"]',
    '.conversation',
    'main',
  ];
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'gemini' },
  };
}

function extractGrok($: cheerio.Root) {
  const title = $('title').text() || 'Grok Conversation';
  const description = $('meta[name="description"]').attr('content') || '';
  
  let content = '';
  const selectors = [
    '[data-testid="primaryColumn"]',
    '[role="main"]',
    'main',
  ];
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'grok' },
  };
}

function extractPerplexity($: cheerio.Root) {
  const title = $('title').text() || 'Perplexity Search';
  const description = $('meta[name="description"]').attr('content') || '';
  
  let content = '';
  const selectors = [
    '[data-testid="search-result"]',
    '.search-result',
    'main',
  ];
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'perplexity' },
  };
}

function extractGeneric($: cheerio.Root) {
  const title = $('title').text() || 'Research Content';
  const description = $('meta[name="description"]').attr('content') || '';
  
  let content = '';
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '#content',
    '.conversation',
    '.chat-messages',
    'body',
  ];
  
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }
  
  return {
    title: cleanText(title),
    content: cleanText(content),
    description: cleanText(description),
    metadata: { provider: 'generic' },
  };
}

function detectProvider(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('claude.ai')) return 'claude';
  if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) return 'chatgpt';
  if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) return 'gemini';
  if (hostname.includes('grok.x.ai') || hostname.includes('x.com/i/grok')) return 'grok';
  if (hostname.includes('perplexity.ai')) return 'perplexity';
  
  return 'other';
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 15000); // Increased limit for better processing
}

export function extractKeywords(text: string): string[] {
  // Enhanced keyword extraction
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'is', 'are', 'was', 'were', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'shall', 'can', 'need', 'ought',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'them', 'us'
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
    .slice(0, 15)
    .map(([word]) => word);
} 