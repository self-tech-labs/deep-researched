# Quick Local Setup Guide

You're seeing a database connection error because the app is trying to connect to a mock database. Here are your options:

## Option 1: Use Real Neon Database (Recommended)

1. **Create a free Neon account**: Go to [neon.tech](https://neon.tech)
2. **Create a new project** (it's free!)
3. **Copy your connection string** from the Neon dashboard
4. **Create your local environment file**:
   ```bash
   cp env.example .env.local
   ```
5. **Edit `.env.local`** and replace the DATABASE_URL:
   ```bash
   DATABASE_URL=postgresql://your_actual_neon_connection_string
   ANTHROPIC_API_KEY=sk-ant-your_key_here  # Optional for now
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
6. **Push the schema to your database**:
   ```bash
   npm run db:push
   ```

## Option 2: Work Without Database (Local Mock Mode)

If you want to test the UI without setting up a database:

1. **Create `.env.local`** with mock settings:
   ```bash
   DATABASE_URL=postgresql://mock:mock@localhost/mock
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
2. **Start the app**:
   ```bash
   npm run dev
   ```

The app will work with in-memory mock data (data won't persist between restarts).

## Option 3: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create a local database**:
   ```bash
   createdb deep_researched
   ```
2. **Set your connection string** in `.env.local`:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/deep_researched
   ```
3. **Push the schema**:
   ```bash
   npm run db:push
   ```

## Next Steps

Once you have the database set up:

1. **Test the app locally**:
   ```bash
   npm run dev
   ```
2. **Visit** http://localhost:3000
3. **Try searching** (will work even with empty database)
4. **Try submitting a research URL** to test the scraping

## Getting an Anthropic API Key (Optional)

For AI-powered content processing:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Generate an API key
4. Add it to your `.env.local` file

Without the API key, the app still works but won't have AI-enhanced titles and descriptions.

---

**Recommendation**: Start with Option 1 (Neon) since it's free and you'll need it for production anyway! 