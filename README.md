# Deep Research Archive

A minimalist web application for sharing and discovering AI-powered research from various LLM providers.

## Features

- **Ultra-minimalist interface** with a single omnipresent search bar
- **Share research links** from Claude, ChatGPT, Gemini, Grok, and other LLM providers
- **Natural language search** to find relevant research
- **Automatic content extraction** and metadata generation
- **Provider filtering** to search within specific AI platforms
- **Social attribution** to credit research contributors

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: Shadcn/UI components with Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Web Scraping**: Cheerio

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd deep-researched
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Neon database connection string

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Sharing Research**: Paste a link from any LLM provider into the search bar. The app will:
   - Detect it's a URL and show an "Add" button
   - Scrape the content from the page
   - Extract metadata and keywords
   - Store it in the database for others to discover

2. **Searching Research**: Type natural language queries to find research. The app will:
   - Search through titles, descriptions, content, and tags
   - Rank results by relevance
   - Allow filtering by provider

## Note

This is a prototype running in local mode. In production, you'll need:
- A Neon database with proper connection string
- Enhanced web scraping for provider-specific content extraction
- Rate limiting and security measures
- Full-text search capabilities for better performance
