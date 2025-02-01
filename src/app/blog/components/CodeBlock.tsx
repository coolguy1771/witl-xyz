'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 p-2 rounded bg-gray-800 text-gray-400 
                 opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-300"
        aria-label={isCopied ? 'Copied!' : 'Copy code'}
      >
        {isCopied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      {language && (
        <div className="absolute right-16 top-2 px-2 py-1 rounded-sm text-xs text-gray-400 bg-gray-800">
          {language}
        </div>
      )}
      <pre className="p-4 rounded-lg bg-gray-900/50 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}