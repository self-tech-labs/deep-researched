'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, User, Calendar } from 'lucide-react';
import { Research } from '@/lib/db/schema';
import { Translations } from '@/lib/i18n';

interface ResearchCardProps {
  research: Research;
  t: Translations;
}

export function ResearchCard({ research, t }: ResearchCardProps) {
  const providerColors: Record<string, string> = {
    claude: 'bg-purple-500',
    chatgpt: 'bg-green-500',
    gemini: 'bg-blue-500',
    grok: 'bg-gray-700',
    perplexity: 'bg-teal-500',
    other: 'bg-gray-500',
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {research.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {research.description || t.noDescription}
            </CardDescription>
          </div>
          <Badge 
            className={`${providerColors[research.provider || 'other']} text-white`}
          >
            {research.provider || t.unknown}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {research.tags && research.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {research.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {research.authorName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{research.authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(research.createdAt)}</span>
              </div>
            </div>
            
            <a
              href={research.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{t.view}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 