import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { renderMarkdown } from '@/lib/markdown';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Hello')).toMatch(/<h1>Hello<\/h1>/);
    expect(renderMarkdown('### Sub')).toMatch(/<h3>Sub<\/h3>/);
    expect(renderMarkdown('###### Six')).toMatch(/<h6>Six<\/h6>/);
  });

  it('renders bold and italic', () => {
    expect(renderMarkdown('**bold**')).toMatch(/<strong>bold<\/strong>/);
    expect(renderMarkdown('__bold__')).toMatch(/<strong>bold<\/strong>/);
    expect(renderMarkdown('*em*')).toMatch(/<em>em<\/em>/);
    expect(renderMarkdown('_em_')).toMatch(/<em>em<\/em>/);
  });

  it('renders inline code', () => {
    expect(renderMarkdown('use `npm install`')).toMatch(/<code>npm install<\/code>/);
  });

  it('renders links safely', () => {
    expect(renderMarkdown('[Site](https://example.com)')).toMatch(/href="https:\/\/example\.com"/);
    expect(renderMarkdown('[Site](javascript:alert(1))')).toMatch(/href="#"/);
  });

  it('renders images', () => {
    expect(renderMarkdown('![alt](https://x.test/img.png)')).toMatch(
      /<img src="https:\/\/x\.test\/img\.png" alt="alt"/,
    );
  });

  it('renders unordered lists', () => {
    const out = renderMarkdown('- a\n- b\n- c');
    expect(out).toMatch(/<ul>/);
    expect(out).toMatch(/<li>a<\/li>/);
    expect(out).toMatch(/<li>c<\/li>/);
  });

  it('renders ordered lists', () => {
    const out = renderMarkdown('1. one\n2. two');
    expect(out).toMatch(/<ol>/);
    expect(out).toMatch(/<li>one<\/li>/);
  });

  it('renders blockquotes', () => {
    expect(renderMarkdown('> quoted')).toMatch(/<blockquote><p>quoted<\/p><\/blockquote>/);
  });

  it('renders horizontal rules', () => {
    expect(renderMarkdown('---')).toMatch(/<hr\s*\/?>/);
  });

  it('renders fenced code blocks', () => {
    const out = renderMarkdown('```js\nconsole.log(1)\n```');
    expect(out).toMatch(/<pre><code class="language-js">/);
    expect(out).toMatch(/console\.log\(1\)/);
  });

  it('escapes HTML in input', () => {
    const out = renderMarkdown('<script>alert(1)</script>');
    expect(out).not.toMatch(/<script>/);
    expect(out).toMatch(/&lt;script&gt;/);
  });

  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown(null as unknown as string)).toBe('');
  });
});

describe('MarkdownRenderer', () => {
  it('renders sanitized HTML with prose classes', () => {
    const { container } = render(<MarkdownRenderer content="**hello**" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('prose');
    expect(root.className).toContain('dark:prose-invert');
    expect(root.className).toContain('max-w-none');
    expect(root.innerHTML).toMatch(/<strong>hello<\/strong>/);
  });

  it('merges custom className', () => {
    const { container } = render(<MarkdownRenderer content="x" className="text-sm" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('text-sm');
    expect(root.className).toContain('prose');
  });

  it('strips dangerous scripts', () => {
    const { container } = render(<MarkdownRenderer content="<script>alert(1)</script>safe" />);
    expect(container.innerHTML).not.toMatch(/<script>/);
  });
});
