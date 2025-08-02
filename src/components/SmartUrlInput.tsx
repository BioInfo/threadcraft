'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isValid: boolean;
  className?: string;
}

const POPULAR_SOURCES = [
  { name: 'Medium', pattern: 'medium.com', icon: '📝' },
  { name: 'Dev.to', pattern: 'dev.to', icon: '👨‍💻' },
  { name: 'TechCrunch', pattern: 'techcrunch.com', icon: '🚀' },
  { name: 'Harvard Business Review', pattern: 'hbr.org', icon: '📊' },
  { name: 'Substack', pattern: 'substack.com', icon: '📰' },
  { name: 'GitHub Blog', pattern: 'github.blog', icon: '🐙' }
];

export const SmartUrlInput = ({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  isValid, 
  className = '' 
}: SmartUrlInputProps) => {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent URLs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('threadcraft-recent-urls');
    if (stored) {
      try {
        setRecentUrls(JSON.parse(stored).slice(0, 3));
      } catch (e) {
        console.error('Failed to parse recent URLs:', e);
      }
    }
  }, []);

  // Save URL to recent when valid
  useEffect(() => {
    if (value && isValid) {
      const updated = [value, ...recentUrls.filter(url => url !== value)].slice(0, 5);
      setRecentUrls(updated);
      localStorage.setItem('threadcraft-recent-urls', JSON.stringify(updated));
    }
  }, [value, isValid]);

  // Smart paste detection
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted text looks like a URL
    if (pastedText.match(/^https?:\/\/.+/)) {
      e.preventDefault();
      onChange(pastedText.trim());
      
      // Show a subtle animation
      if (inputRef.current) {
        inputRef.current.classList.add('animate-pulse');
        setTimeout(() => {
          inputRef.current?.classList.remove('animate-pulse');
        }, 500);
      }
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 300);
    onBlur?.();
  };

  const selectSuggestion = (url: string) => {
    onChange(url);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSourceInfo = (url: string) => {
    const source = POPULAR_SOURCES.find(s => url.includes(s.pattern));
    return source || { name: 'Article', icon: '📄' };
  };

  return (
    <div className="relative">
      {/* reserve a tiny spacer to avoid overlap with elements below when dropdown is open */}
      <div className={`${showSuggestions ? 'pb-6 md:pb-8' : ''}`}>
        <div className="relative">
          <input
            ref={inputRef}
            type="url"
            required
            placeholder="Paste your article URL here (e.g., https://example.com/article)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            className={`w-full input-enhanced text-lg py-4 px-4 transition-all duration-300 ${
              focused ? 'transform scale-[1.02]' : ''
            } ${
              value && !isValid ? 'border-red-300 bg-red-50' :
              value && isValid ? 'border-green-300 bg-green-50' : ''
            } ${className}`}
          />
          
          {/* URL Validation Indicator */}
          {value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <div className="text-green-500 animate-scale-in">
                  <Icons.Check />
                </div>
              ) : (
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Smart Suggestions Dropdown */}
      {showSuggestions && (focused || value.length === 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 mb-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in max-h-80 overflow-y-auto">
          
          {/* Recent URLs */}
          {recentUrls.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <h4 className="text-[10px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Recent URLs
              </h4>
              <div className="space-y-0.5">
                {recentUrls.map((url, index) => {
                  const source = getSourceInfo(url);
                  return (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(url)}
                      className="w-full text-left p-1.5 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-5">{source.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] leading-4 font-medium text-gray-900 truncate">
                            {source.name}
                          </p>
                          <p className="text-[11px] leading-4 text-gray-500 truncate">
                            {url}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-gray-400">
                          <Icons.Link />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Sources */}
          <div className="p-2">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Popular Sources
            </h4>
            {/* 2 rows x 3 columns (6 items total) to reduce dropdown height */}
            <div className="grid grid-cols-3 gap-1">
              {POPULAR_SOURCES.map((source, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    window.open(`https://${source.pattern}`, '_blank');
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-[12px] leading-4">{source.icon}</span>
                  <span className="text-[11px] leading-4 text-gray-700 truncate">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-2 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start gap-1.5">
              <div className="text-blue-500 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] leading-4 font-medium text-blue-900">Pro Tip</p>
                <p className="text-[11px] leading-4 text-blue-700">
                  Copy any article URL and paste it here. We'll automatically detect and validate it!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};