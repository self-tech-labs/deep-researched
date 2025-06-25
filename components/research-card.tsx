'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, User, Calendar, Heart } from 'lucide-react';
import { Research } from '@/lib/db/schema';

interface ResearchCardProps {
  research: Research;
}

export function ResearchCard({ research }: ResearchCardProps) {
  const [upvotes, setUpvotes] = useState(research.upvotes || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

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

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting || hasUpvoted) return;

    setIsUpvoting(true);
    try {
      const response = await fetch('/api/research/upvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ researchId: research.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUpvotes(data.newUpvoteCount || upvotes + 1);
        setHasUpvoted(true);
      } else {
        console.error('Failed to upvote:', data.error);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setIsUpvoting(false);
    }
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
              {research.description || 'No description available'}
            </CardDescription>
          </div>
          <Badge 
            className={`${providerColors[research.provider || 'other']} text-white`}
          >
            {research.provider || 'Unknown'}
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
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                disabled={isUpvoting || hasUpvoted}
                className={`h-8 px-2 ${hasUpvoted ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart 
                  className={`h-4 w-4 mr-1 ${hasUpvoted ? 'fill-current' : ''}`} 
                />
                <span className="text-xs">{upvotes}</span>
              </Button>
              
              <a
                href={research.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 