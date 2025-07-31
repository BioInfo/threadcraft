'use client';

import { useState } from 'react';
import { Icons } from './Icons';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

export const CopyButton = ({ text, className = "", variant = 'default' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
          copied 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${className}`}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? <Icons.Check /> : <Icons.Copy />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 transform hover:scale-105 ${
        copied 
          ? 'bg-green-100 text-green-700 border border-green-200 scale-105' 
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
      } ${className}`}
    >
      {copied ? <Icons.Check /> : <Icons.Copy />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};