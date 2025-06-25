'use client';

import { useEffect, useState } from 'react';
import { ResearchCard } from './research-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Research } from '@/lib/db/schema';

interface FeaturedResearchProps {
  onSearchClick: () => void;
}

export function FeaturedResearch({ onSearchClick }: FeaturedResearchProps) {
  const [featuredData, setFeaturedData] = useState<{
    recent: Research[];
    popular: Research[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/research/featured');
        const data = await response.json();
        
        if (response.ok) {
          setFeaturedData(data);
        }
      } catch (error) {
        console.error('Error fetching featured research:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-4">Loading featured research...</p>
      </div>
    );
  }

  if (!featuredData) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Recent Research */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Research</h2>
          </div>
          <Button variant="outline" onClick={onSearchClick}>
            View All
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredData.recent.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      </section>

      {/* Popular Research */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Research</h2>
          </div>
          <Button variant="outline" onClick={onSearchClick}>
            View All
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredData.popular.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      </section>
    </div>
  );
} 