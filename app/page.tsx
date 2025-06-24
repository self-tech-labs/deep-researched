'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResearchCard } from '@/components/research-card';
import { SubmitDialog } from '@/components/submit-dialog';
import { Search, Plus, Loader2, Sparkles } from 'lucide-react';
import { isValidUrl } from '@/lib/search';
import { Research } from '@/lib/db/schema';
import { useDebounce } from '@/hooks/use-debounce';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
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

  useEffect(() => {
    if (debouncedQuery && !isValidUrl(debouncedQuery)) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValidUrl(query)) {
      setIsSubmitOpen(true);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Deep Research Archive
          </h1>
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
              placeholder="Search for research or paste a research URL..."
              className="w-full h-14 pl-5 pr-32 text-lg rounded-full shadow-lg border-2 focus:border-primary"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {isValidUrl(query) ? (
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full"
                  disabled={!query.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

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
                  Try different keywords or be the first to add research on this topic!
                </p>
                <Button
                  onClick={() => setIsSubmitOpen(true)}
                  variant="outline"
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Research
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && !query && (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Deep Research Archive
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              Search for existing AI research or share your own by pasting a link from any LLM provider.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setIsSubmitOpen(true)}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Share Research
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Dialog */}
      <SubmitDialog
        open={isSubmitOpen}
        onOpenChange={(open) => {
          setIsSubmitOpen(open);
          if (!open && isValidUrl(query)) {
            setQuery('');
          }
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
