import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOAuth } from '@/hooks/use-oauth';

afterEach(() => {
  vi.restoreAllMocks();
});

function mockPopup(): { popup: any; close: any } {
  const close = vi.fn();
  const popup = { close, closed: false };
  (window as any).open = vi.fn(() => popup);
  return { popup, close };
}

describe('useOAuth', () => {
  it('opens a popup with the expected URL', () => {
    const openSpy = vi.fn(() => ({ close: vi.fn(), closed: false }));
    (window as any).open = openSpy;
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useOAuth({ onSuccess }));

    act(() => result.current.start('github'));

    expect(openSpy).toHaveBeenCalled();
    const [url, name] = openSpy.mock.calls[0] as unknown as [string, string];
    expect(url).toBe('/auth/github');
    expect(name).toContain('oauth_github');
  });

  it('uses custom apiBaseUrl when provided', () => {
    const openSpy = vi.fn(() => ({ close: vi.fn(), closed: false }));
    (window as any).open = openSpy;
    const { result } = renderHook(() => useOAuth({ apiBaseUrl: 'https://api.example.com' }));

    act(() => result.current.start('discord'));

    expect((openSpy.mock.calls[0] as unknown as [string, string])[0]).toBe('https://api.example.com/auth/discord');
  });

  it('reports error when popup is blocked', () => {
    (window as any).open = vi.fn(() => null);
    const onError = vi.fn();
    const { result } = renderHook(() => useOAuth({ onError }));

    act(() => result.current.start('github'));

    expect(result.current.error).toMatch(/Popup blocked/i);
    expect(onError).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('calls onSuccess when popup posts mcp-oauth message', () => {
    const { popup } = mockPopup();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useOAuth({ onSuccess }));

    act(() => result.current.start('github'));

    const event = new MessageEvent('message', {
      // The hook rejects any message whose origin doesn't match the current
      // window; emulate a same-origin postMessage so the security check passes.
      origin: window.location.origin,
      data: {
        type: 'mcp-oauth',
        token: 'tok123',
        user: { id: 'u1', username: 'alice' },
      },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(onSuccess).toHaveBeenCalledWith({
      token: 'tok123',
      user: { id: 'u1', username: 'alice' },
    });
    expect(popup.close).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('calls onError when popup posts mcp-oauth-error', () => {
    mockPopup();
    const onError = vi.fn();
    const { result } = renderHook(() => useOAuth({ onError }));

    act(() => result.current.start('github'));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'mcp-oauth-error', error: 'denied' },
        }),
      );
    });

    expect(result.current.error).toBe('denied');
    expect(onError).toHaveBeenCalledWith('denied');
  });

  it('ignores unrelated postMessage events', () => {
    mockPopup();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useOAuth({ onSuccess, onError }));

    act(() => result.current.start('github'));

    act(() => {
      // Same-origin messages with an unrecognized/empty payload must still be
      // ignored — proving the guard is payload-typed, not just origin-typed.
      window.dispatchEvent(new MessageEvent('message', { origin: window.location.origin, data: { foo: 'bar' } }));
      window.dispatchEvent(new MessageEvent('message', { origin: window.location.origin, data: null }));
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });
});
