'use client';

import { useEffect, useState } from 'react';

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    const headings = Array.from(headingElements).map((heading) => ({
      id: heading.id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
    }));

    setHeadings(headings);
  }, [content]);

  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-100px 0px -80% 0px',
    });

    const headingElements = document.querySelectorAll('h2, h3');
    headingElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-20 space-y-2 text-sm">
      <p className="font-medium mb-4 text-base">Table of Contents</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors ${
                activeId === heading.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}