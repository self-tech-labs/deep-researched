'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResearchCard } from '@/components/research-card';
import { Search, Loader2, Sparkles, CheckCircle, AlertCircle, Heart, ExternalLink } from 'lucide-react';
import { isValidUrl } from '@/lib/search';
import { Research } from '@/lib/db/schema';
import { useDebounce } from '@/hooks/use-debounce';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedProvider && { provider: selectedProvider }),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider]);

  const handleSubmitUrl = async (url: string) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit research');
      }

      setSubmitStatus('success');
      setSubmitMessage('Research added successfully!');
      setQuery('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 3000);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'An error occurred');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery && !isValidUrl(debouncedQuery)) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValidUrl(query)) {
      handleSubmitUrl(query);
    } else if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleRefresh = () => {
    if (query.trim() && !isValidUrl(query)) {
      handleSearch(query);
    }
  };

  const providers = ['claude', 'chatgpt', 'gemini', 'grok', 'perplexity'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Deep Research Archive
            </h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full border">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">by</span>
              <a 
                href="https://ritsl.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors flex items-center gap-1"
              >
                RITSL.COM
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Share and discover AI-powered research from across the web
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleInputSubmit} className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for research or paste a research URL to add it..."
              className="w-full h-14 pl-5 pr-32 text-lg rounded-full shadow-lg border-2 focus:border-primary"
              disabled={isSubmitting}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                type="submit"
                size="lg"
                className="rounded-full"
                disabled={!query.trim() || isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Submit Status */}
        {submitStatus !== 'idle' && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              submitStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitStatus === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{submitMessage}</span>
            </div>
          </div>
        )}

        {/* Provider Filter */}
        {!isValidUrl(query) && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <Badge
              variant={selectedProvider === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedProvider(null)}
            >
              All Providers
            </Badge>
            {providers.map((provider) => (
              <Badge
                key={provider}
                variant={selectedProvider === provider ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors capitalize"
                onClick={() => setSelectedProvider(provider)}
              >
                {provider}
              </Badge>
            ))}
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-4">Searching research archive...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Found {results.length} research{results.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((research) => (
                    <ResearchCard key={research.id} research={research} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No research found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try different keywords or paste a research URL to add new content!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && !query && (
          <div className="text-center py-16">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Deep Research Archive
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Search through curated AI research or simply paste a URL to add new content to the archive.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto text-left">
              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Search className="h-6 w-6 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Search Research</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Find existing research by keywords, topics, or AI provider. Our archive contains curated content from Claude, ChatGPT, Gemini, and more.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Just type your search terms in the bar above
                </p>
              </div>

              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Add Research</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Share valuable AI research by pasting a URL. We'll automatically extract and index the content for others to discover.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Paste any research URL in the search bar and press Enter
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a 
                href="https://ritsl.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                RITSL.COM
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              © 2024 RITSL.COM - Empowering AI Research Discovery
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
