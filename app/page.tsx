'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResearchCard } from '@/components/research-card';
import { SuggestionDialog } from '@/components/suggestion-dialog';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Search, Loader2, Sparkles, CheckCircle, AlertCircle, Heart, ExternalLink, RefreshCw } from 'lucide-react';
import { isValidUrl } from '@/lib/search';
import { Research } from '@/lib/db/schema';
import { useDebounce } from '@/hooks/use-debounce';
import { Language, getTranslations } from '@/lib/i18n';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Research[]>([]);
  const [recentResearches, setRecentResearches] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const t = getTranslations(language);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Fetch recent researches on component mount
  const fetchRecentResearches = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const response = await fetch('/api/research');
      const data = await response.json();

      if (response.ok) {
        // Sort by creation date (most recent first) and take first 12
        const sortedResearches = (data.researches || [])
          .sort((a: Research, b: Research) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 12);
        setRecentResearches(sortedResearches);
      } else {
        console.error('Failed to fetch recent researches:', data.error);
        setRecentResearches([]);
      }
    } catch (error) {
      console.error('Error fetching recent researches:', error);
      setRecentResearches([]);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentResearches();
  }, [fetchRecentResearches]);

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
      setSubmitMessage(t.researchAdded);
      setQuery('');
      
      // Refresh recent researches to show the new addition
      fetchRecentResearches();
      
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
    } else if (!hasSearched) {
      fetchRecentResearches();
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
              {t.title}
            </h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full border">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t.by}</span>
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
            {t.subtitle}
          </p>
          
          {/* Language Switcher and Suggestion Button */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <LanguageSwitcher 
              currentLanguage={language} 
              onLanguageChange={handleLanguageChange} 
            />
            <SuggestionDialog t={t} />
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleInputSubmit} className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
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

        {/* Provider Filter - only show when searching */}
        {!isValidUrl(query) && hasSearched && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <Badge
              variant={selectedProvider === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedProvider(null)}
            >
              {t.allProviders}
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

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-4">{t.searching}</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {results.length === 1 
                      ? `1 ${t.foundResult}` 
                      : `${results.length} ${t.foundResults}`}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((research) => (
                    <ResearchCard key={research.id} research={research} t={t} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t.noResultsTitle}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t.noResultsMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Research - show when not searching */}
        {!hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t.recentResearchTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t.recentResearchSubtitle}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingRecent}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingRecent ? 'animate-spin' : ''}`} />
                {t.refresh}
              </Button>
            </div>

            {isLoadingRecent ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-4">{t.loadingRecent}</p>
              </div>
            ) : recentResearches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentResearches.map((research) => (
                  <ResearchCard key={research.id} research={research} t={t} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-8">
                  <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t.welcomeTitle}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {t.noResearchYet}
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto text-left">
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Search className="h-6 w-6 text-blue-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.searchResearchTitle}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {t.searchResearchDescription}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t.searchResearchHint}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.addResearchTitle}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {t.addResearchDescription}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t.addResearchHint}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t.madeWith}</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>{t.by}</span>
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
              {t.copyright}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
