import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Cryptographically-secure random ID. Used for nonces, OAuth state, CSRF
 * tokens, and any value that must not be predictable to an attacker.
 *
 * C43 (AUDIT.md): the previous implementation fell back to `Math.random()`
 * when `crypto.getRandomValues` was unavailable, which would have silently
 * shipped an insecure token (Math.random is a small-period PRNG; guessing
 * the next token from a few observations is trivial). We now throw instead
 * — Node 20 and modern browsers always provide `crypto.getRandomValues`,
 * so reaching the throw means a misconfigured environment the caller needs
 * to know about, NOT a value to round-trip to the network. Also removed
 * the modulo bias: the previous `% chars.length` skewed the char
 * distribution because 256 is not divisible by 36. We now resample any
 * byte >= the nearest multiple of `chars.length` so every char is
 * uniformly distributed.
 */
export function randomId(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charsLen = chars.length;
  // `Crypto` is the type of `globalThis.crypto` / `crypto` in Node 19+.
  type CryptoLike = { getRandomValues<T extends ArrayBufferView>(arr: T): T };
  const w: typeof globalThis & { crypto?: CryptoLike } = globalThis;
  const c: CryptoLike | null =
    typeof w.crypto !== 'undefined' && typeof w.crypto.getRandomValues === 'function'
      ? w.crypto
      : null;
  if (!c) {
    throw new Error(
      'randomId: crypto.getRandomValues is unavailable — refusing to generate an insecure ID. Ensure Node >= 19 or a secure-context browser.',
    );
  }
  return randomIdWith(c, length, chars, charsLen);
}

function randomIdWith(
  c: { getRandomValues<T extends ArrayBufferView>(arr: T): T },
  length: number,
  chars: string,
  charsLen: number,
): string {
  // Uniform-sample: reject bytes >= 252 (the nearest multiple of charsLen
  // below 256 for a 36-char alphabet). Cost is negligible; the resample
  // distribution is uniform.
  const maxByte = Math.floor(256 / charsLen) * charsLen;
  let result = '';
  let buf = new Uint8Array(length);
  let pos = 0;
  while (pos < length) {
    c.getRandomValues(buf);
    for (let i = 0; i < buf.length && pos < length; i++) {
      const b = buf[i];
      if (b < maxByte) {
        result += chars.charAt(b % charsLen);
        pos++;
      }
    }
  }
  return result;
}
