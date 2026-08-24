'use client';

import { renderMarkdown } from '@/lib/markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = renderMarkdown(content);
  const baseClass = 'prose dark:prose-invert max-w-none';
  return (
    <div
      className={className ? `${baseClass} ${className}` : baseClass}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
