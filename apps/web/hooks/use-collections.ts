'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sdk } from '@/services/api';
import type { Collection, CollectionDetail } from '@mcp/types';

export function useCollections(params?: { userId?: string; page?: number; limit?: number }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number }>({
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await sdk.listCollections(params);
      if (controller.signal.aborted) return;
      const data = res.data ?? res;
      setCollections(Array.isArray(data) ? data : (data.data ?? []));
      if (data.meta) setMeta(data.meta);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      setError(err?.message || 'Failed to load collections');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [params?.userId, params?.page, params?.limit]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { collections, meta, loading, error, refetch: fetchData };
}

export function useCollection(id: string) {
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await sdk.getCollection(id);
      if (controller.signal.aborted) return;
      setCollection(res.data);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      if (err?.statusCode === 404) setNotFound(true);
      else setError(err?.message || 'Failed to load collection');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { collection, loading, error, notFound, refetch: fetchData };
}

export function useMyCollections(page = 1, limit = 20) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number }>({
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await sdk.getMyCollections(page, limit);
      if (controller.signal.aborted) return;
      setCollections(Array.isArray(res.data) ? res.data : []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      setError(err?.message || 'Failed to load your collections');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { collections, meta, loading, error, refetch: fetchData };
}
