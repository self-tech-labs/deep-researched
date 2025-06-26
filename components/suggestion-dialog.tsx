'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Translations } from '@/lib/i18n';

interface SuggestionDialogProps {
  t: Translations;
}

export function SuggestionDialog({ t }: SuggestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || message.length < 10) {
      setSubmitStatus('error');
      setSubmitMessage('Please provide a suggestion of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send suggestion');
      }

      setSubmitStatus('success');
      setSubmitMessage(t.suggestionSuccess);
      
      // Clear form
      setMessage('');
      setName('');
      setEmail('');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 2000);
      
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setName('');
    setEmail('');
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t.suggestionsTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.suggestionsTitle}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.suggestionsDescription}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggestion-message">
              {t.suggestionPlaceholder.split('...')[0]}
            </Label>
            <Textarea
              id="suggestion-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.suggestionPlaceholder}
              rows={4}
              required
              minLength={10}
              maxLength={1000}
              disabled={isSubmitting || submitStatus === 'success'}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-name">
                {t.namePlaceholder.replace(' (optional)', '')} 
                <span className="text-muted-foreground ml-1">({t.optional})</span>
              </Label>
              <Input
                id="suggestion-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={100}
                disabled={isSubmitting || submitStatus === 'success'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suggestion-email">
                {t.emailPlaceholder.replace(' (optional)', '')}
                <span className="text-muted-foreground ml-1">({t.optional})</span>
              </Label>
              <Input
                id="suggestion-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={isSubmitting || submitStatus === 'success'}
              />
            </div>
          </div>
          
          {/* Status Message */}
          {submitStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              submitStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitStatus === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{submitMessage}</span>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || message.length < 10 || isSubmitting || submitStatus === 'success'}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t.sendSuggestion}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 