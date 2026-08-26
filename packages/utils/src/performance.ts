/**
 * A function wrapper exposing a `cancel()` to clear any pending trailing
 * call. Returned by {@link debounce} and {@link throttle} so callers can free
 * the underlying timer on unmount (eg. inside a React cleanup effect) and
 * avoid invoking the wrapped `fn` after the component has torn down.
 */
export interface Cancellable<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): Cancellable<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as Cancellable<T>;
  // Expose `cancel()` so callers can clear a pending call on unmount (eg.
  // in a React component's cleanup effect) and avoid firing after teardown.
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): Cancellable<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  let inThrottle = false;
  const throttled = ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      timeoutId = setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as Cancellable<T>;
  // Expose `cancel()` so callers can clear the in-throttle window timer on
  // unmount and avoid the trailing state change from firing after teardown.
  throttled.cancel = () => {
    clearTimeout(timeoutId);
    inThrottle = false;
  };
  return throttled;
}

function stableStringify(args: unknown[]): string {
  const seen = new WeakSet();
  return JSON.stringify(args, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      if (!Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((sorted: Record<string, unknown>, key: string) => {
            sorted[key] = value[key];
            return sorted;
          }, {});
      }
    }
    return value;
  });
}

export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: { maxSize?: number },
): T {
  // Bounded cache to avoid a slow memory leak on long-lived clients. Default
  // 128 entries; the LRU is approximated by re-inserting on access (Map
  // preserves insertion order, so `delete` + `set` moves the freshest key
  // to the end, and the oldest is evicted via the first key). Callers that
  // need a larger working set pass `options.maxSize`.
  const maxSize = options?.maxSize ?? 128;
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: unknown[]) => {
    const key = stableStringify(args);
    if (cache.has(key)) {
      const hit = cache.get(key);
      cache.delete(key);
      cache.set(key, hit as ReturnType<T>);
      return hit;
    }
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    if (cache.size > maxSize) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    return result;
  }) as T;
}

export async function retry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
