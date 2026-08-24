/**
 * Minimal dependency-free HTML → Markdown converter for imported project
 * bodies (Modrinth serves HTML). Preserves structure that our markdown
 * renderer understands; strips anything else.
 */
export function htmlToMarkdown(html: string): string {
  let s = html;

  // Drop non-content blocks entirely
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<details[^>]*>/gi, '\n').replace(/<\/details>/gi, '\n');
  s = s.replace(/<summary[^>]*>([\s\S]*?)<\/summary>/gi, '**$1**\n');

  // Headings (# count matches original level)
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_m, lvl: string, txt: string) => `\n${'#'.repeat(Number(lvl))} ${txt.trim()}\n\n`);

  // Inline styles
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '_$2_');
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');

  // Links + images
  s = s.replace(/<img[^>]+src="([^"]*)"[^>]*>/gi, '\n![]($1)\n');
  s = s.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Lists
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');

  // Blocks
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|ul|ol|table|tr|h[1-6]|blockquote|pre)>/gi, '\n\n');
  s = s.replace(/<hr\s*\/?>/gi, '\n---\n');
  s = s.replace(/<blockquote[^>]*>/gi, '> ');

  // Strip any remaining tags, then decode entities
  s = s.replace(/<[^>]+>/g, '');
  const entities: Record<string, string> = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&hellip;': '…', '&mdash;': '—',
    '&ndash;': '–', '&laquo;': '«', '&raquo;': '»', '&copy;': '©',
  };
  s = s.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&hellip;|&mdash;|&ndash;|&laquo;|&raquo;|&copy;/g, (m) => entities[m] ?? m);

  // Tidy whitespace
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

/** Heuristic: does this look like an HTML document fragment? */
export function looksLikeHtml(text: string): boolean {
  return /<\/?(p|div|span|strong|em|b|i|h[1-6]|ul|ol|li|br|img|a|code|pre|table)\b/i.test(text);
}
