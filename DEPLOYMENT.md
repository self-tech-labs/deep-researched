# Production Deployment Guide

This guide will help you deploy Deep Research Archive to production using Vercel, Neon, and Anthropic.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **Anthropic API Key**: Get one from [console.anthropic.com](https://console.anthropic.com)
4. **GitHub Account**: For connecting your repository

## Step 1: Set Up Neon Database

1. **Create a Neon Project**:
   - Go to [neon.tech](https://neon.tech) and create an account
   - Create a new project (choose a region close to your users)
   - Note down your connection string (it looks like: `postgresql://user:password@host/database`)

2. **Set Up Database Schema**:
   ```bash
   # Install dependencies locally first
   npm install
   
   # Set your DATABASE_URL in .env.local
   echo "DATABASE_URL=your_neon_connection_string" >> .env.local
   
   # Generate and push the schema
   npm run db:generate
   npm run db:push
   ```

## Step 2: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository containing this code

2. **Configure Environment Variables**:
   In the Vercel project settings, add these environment variables:
   ```
   DATABASE_URL=postgresql://your_neon_connection_string
   ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-app-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add ANTHROPIC_API_KEY
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

## Step 4: Install Dependencies

Make sure to install the new production dependencies:

```bash
npm install @anthropic-ai/sdk@^0.27.3 rate-limiter-flexible@^5.0.3 zod@^3.23.8
```

## Step 5: Run Database Migrations

After your first deployment:

```bash
# If you have the Vercel CLI installed
vercel env pull .env.local
npm run db:push
```

## Step 6: Test Your Deployment

1. **Test Search**: Try searching for content
2. **Test Submission**: Submit a research URL from Claude, ChatGPT, etc.
3. **Check Database**: Verify data is being stored in Neon
4. **Monitor Logs**: Check Vercel function logs for any errors

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | `sk-ant-api03-...` |
| `NEXT_PUBLIC_BASE_URL` | Your app's public URL | `https://my-app.vercel.app` |

## Security Considerations

1. **Rate Limiting**: The app includes built-in rate limiting
2. **Input Validation**: All inputs are validated with Zod schemas
3. **CORS**: Properly configured for API endpoints
4. **Environment Variables**: Never commit API keys to version control

## Monitoring and Maintenance

1. **Vercel Analytics**: Enable in your Vercel dashboard
2. **Error Tracking**: Consider adding Sentry or similar
3. **Database Monitoring**: Use Neon's built-in monitoring
4. **API Usage**: Monitor Anthropic API usage and costs

## Scaling Considerations

- **Database**: Neon handles scaling automatically
- **Functions**: Vercel Edge Functions for better performance
- **CDN**: Vercel provides global CDN by default
- **Background Processing**: Consider adding a queue system for heavy processing

## Troubleshooting

### Common Issues:

1. **Build Errors**: Make sure all dependencies are installed
2. **Database Connection**: Verify your connection string format
3. **API Key Issues**: Ensure Anthropic API key is valid
4. **Rate Limits**: Check if you're hitting API rate limits

### Getting Help:

- Check Vercel deployment logs
- Review Neon database logs
- Verify environment variables are set correctly
- Test API endpoints individually

## Production Checklist

- [ ] Neon database created and configured
- [ ] Anthropic API key obtained
- [ ] Repository connected to Vercel
- [ ] Environment variables set
- [ ] Database schema deployed
- [ ] Dependencies installed
- [ ] App deployed and accessible
- [ ] Search functionality tested
- [ ] Submission functionality tested
- [ ] Rate limiting working
- [ ] Error handling tested

## Cost Estimates

- **Vercel**: Free tier covers most small projects
- **Neon**: Free tier includes 512MB database
- **Anthropic**: Pay-per-use, typically $0.25-$3 per 1K tokens

Your app should comfortably run on free tiers for development and small-scale production use. 