import DOMPurify from 'dompurify';

function escapeHtml(input: string): string {
  // Escaping MUST emit real HTML entities. The replacement strings are
  // composed at runtime so tooling can never silently collapse the
  // entities back to their literal characters (the previous impl was a
  // no-op that rendered raw markup through dangerouslySetInnerHTML).
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escapeAttr(input: string): string {
  // Attributes live inside double quotes, so quotes must be escaped too.
  // Reuse escapeHtml (already escapes '"' and "'") and add backtick
  // defense against attribute-breakout via template literals.
  return escapeHtml(input).replace(/`/g, '&#x60;');
}

/**
 * Reject dangerous URL schemes in attribute values. `javascript:`/`vbscript:`
 * execute script when the element loads or is clicked; `data:` can ship
 * arbitrary payloads — for `img`/`a` we only allow `http(s):`, `mailto:`,
 * and same-origin relative/absolute-path URLs. The check is case-insensitive
 * and tolerates leading whitespace / control chars which browsers strip
 * before resolving the scheme (eg. `java\tscript:`).
 *
 * B13: previously only the unsafe schemes reached the server-side regex
 * sanitizer, where a single-quote or unquoted `javascript:` value slipped
 * past a double-quote-only scrub. Rejecting at the inline builder (not just
 * post-strip) means the dangerous value is rewritten to `#` BEFORE the
 * attribute is interpolated, so no regex surface depends on quote style.
 */
function isSafeUrlScheme(value: string): boolean {
  // Strip whitespace and ASCII control chars (0x00-0x20, 0x7F) that
  // browsers silently drop before parsing the scheme.
  const stripped = value.replace(/[\x00-\x20\x7F]/g, '');
  if (stripped === '') return true; // empty href falls through to '#' by callers
  // Relative or server-absolute paths are always safe (no scheme).
  if (/^[/#]/.test(stripped) || !/:/.test(stripped)) return true;
  // Allowlisted absolute schemes only. `mailto:` is fine for `href`;
  // `tel:` is harmless. We deliberately DO NOT allow `data:` for images
  // — a data: URL can ship an arbitrary script payload in some UAs and
  // we have no need for inline images here.
  const scheme = stripped.toLowerCase().split(':')[0];
  return scheme === 'http' || scheme === 'https' || scheme === 'mailto' || scheme === 'tel';
}

function safeHrefUrl(href: string): string {
  return isSafeUrlScheme(href) ? href : '#';
}

function inline(input: string): string {
  let s = input;

  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);

  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, src, title) => {
    // B13: reject dangerous schemes at the builder so `javascript:`/`data:`
    // images fall back to `#` before they ever reach the post-strip regex
    // (which is double-quote-only and misses single/unquoted variants).
    const safeSrc = safeHrefUrl(src);
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    return `<img src="${escapeAttr(safeSrc)}" alt="${escapeAttr(alt)}" loading="lazy"${titleAttr} />`;
  });

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, text, href, title) => {
    // Same guard as for images: kill `javascript:`/`vbscript:`/`data:` hrefs
    // at the source rather than relying on a quote-dependent post-strip.
    const safeHref = safeHrefUrl(href);
    const allowlisted = /^(https?:|mailto:|\/)/i.test(safeHref) ? safeHref : '#';
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    const isExternal = /^https?:/i.test(allowlisted);
    const extra = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeAttr(allowlisted)}"${titleAttr}${extra}>${inline(text)}</a>`;
  });

  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');

  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');

  return s;
}

export function renderMarkdown(md: string): string {
  if (!md || typeof md !== 'string') return '';

  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const hrMatch = /^(\s*[-*_]){3,}\s*$/.test(line);
    if (hrMatch) {
      out.push('<hr />');
      i++;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inline(escapeHtml(headingMatch[2].trim()))}</h${level}>`);
      i++;
      continue;
    }

    const blockquoteMatch = /^>\s?(.*)$/.exec(line);
    if (blockquoteMatch) {
      const buffer: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote><p>${inline(escapeHtml(buffer.join(' ')))}</p></blockquote>`);
      continue;
    }

    const listMatch = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[2]);
      const items: string[] = [];
      while (
        i < lines.length &&
        /^(\s*)([-*+]|\d+\.)\s+(.*)$/.test(lines[i])
      ) {
        const itemMatch = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i])!;
        items.push(`<li>${inline(escapeHtml(itemMatch[3].trim()))}</li>`);
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    const codeFence = /^```([\w-]*)\s*$/.exec(line);
    if (codeFence) {
      const lang = codeFence[1] || '';
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++;
      const langClass = lang ? ` class="language-${escapeAttr(lang)}"` : '';
      out.push(`<pre><code${langClass}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^(\s*[-*_]){3,}\s*$/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+\.)\s+/.test(lines[i]) &&
      !/^```/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(escapeHtml(paragraph.join(' ')))}</p>`);
  }

  const html = out.join('\n');

  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ['target', 'rel'],
    });
  }

  // Server-side path: no DOM is available so DOMPurify (which needs a window)
  // cannot run. Every interpolated text node + attribute value is already
  // escaped via escapeHtml/escapeAttr above, but we additionally strip
  // disallowed tags, on* attributes, and javascript: URLs so the server
  // output is attribute-safe even if MarkdownRenderer is later routed through
  // an RSC subtree. The allow-list mirrors the tags this transformer emits.
  return html
    .replace(/<(?!\s*\/?(?:p|h[1-6]|hr|blockquote|ul|ol|li|pre|code|img|a|strong|em|b|i)\b)/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/gi, '')
    // B13: scrub dangerous URL schemes in ANY quote style (double, single,
    // or unquoted). `javascript:|vbscript:|data:` all execute / smuggle
    // payloads in some UAs. The previous double-quote-only regex left
    // <img src='javascript:...'> and <img src=javascript:...> untouched.
    .replace(
      /((?:href|src)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi,
      (match: string, prefix: string, dq: string | undefined, sq: string | undefined, unq: string | undefined) => {
        const value = dq ?? sq ?? unq ?? '';
        return isSafeUrlScheme(value) ? match : `${prefix}"#"`;
      },
    );
}
