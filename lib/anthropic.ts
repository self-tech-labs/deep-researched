import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ProcessedContent {
  title: string;
  description: string;
  summary: string;
  keywords: string[];
  category: string;
}

export async function processResearchContent(content: string, url: string): Promise<ProcessedContent | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not configured, skipping content processing');
    return null;
  }

  try {
    const prompt = `Please analyze this research content and extract structured information. The content comes from: ${url}

Content:
${content.substring(0, 8000)} ${content.length > 8000 ? '...' : ''}

Please provide a JSON response with:
1. "title": A concise, descriptive title (max 100 chars)
2. "description": A 2-3 sentence summary (max 300 chars)  
3. "summary": A detailed summary of the key findings (max 500 chars)
4. "keywords": Array of 5-10 relevant keywords/topics
5. "category": One category from: ["AI/ML", "Programming", "Research", "Data Science", "Technology", "Business", "Science", "Other"]

Respond with valid JSON only.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    const result = JSON.parse(textContent.text);
    
    // Validate the response structure
    if (!result.title || !result.description || !result.keywords || !Array.isArray(result.keywords)) {
      throw new Error('Invalid response structure from Anthropic');
    }

    return {
      title: result.title.substring(0, 100),
      description: result.description.substring(0, 300),
      summary: result.summary?.substring(0, 500) || result.description,
      keywords: result.keywords.slice(0, 10),
      category: result.category || 'Other'
    };
  } catch (error) {
    console.error('Error processing content with Anthropic:', error);
    return null;
  }
}

export { anthropic }; 