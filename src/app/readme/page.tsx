'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReadmePage() {
  const [readmeContent, setReadmeContent] = useState('');

  useEffect(() => {
    fetch('/README.md')
      .then((res) => res.text())
      .then((text) => setReadmeContent(text));
  }, []);

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="prose lg:prose-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{readmeContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}