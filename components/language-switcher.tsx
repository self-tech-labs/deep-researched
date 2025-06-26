'use client';

import { Button } from '@/components/ui/button';
import { Languages, Globe } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">Language</span>
      </div>
      
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-colors">
        <div 
          className={`absolute top-1 bottom-1 w-20 bg-white dark:bg-gray-700 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            currentLanguage === 'fr' ? 'translate-x-20' : 'translate-x-0'
          }`}
        />
        
        <div className="relative flex">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 w-20 text-sm font-medium rounded-full transition-colors duration-200 ${
                currentLanguage === lang.code
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span className="text-xs font-semibold">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 