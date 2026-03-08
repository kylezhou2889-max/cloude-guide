import { useState, useEffect, useCallback } from 'react';
import type { LLMModel } from '@/data/models';
import { staticModels } from '@/data/models';

const CACHE_KEY = 'openclaw_models_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: LLMModel[];
  timestamp: number;
  source: 'github' | 'static';
}

// Provider files to fetch from openclaw repo
const PROVIDER_FILES = [
  'src/providers/openai.ts',
  'src/providers/google-shared.ts',
  'src/providers/anthropic.ts',
  'src/providers/deepseek.ts',
  'src/providers/mistral.ts',
  'src/providers/cohere.ts',
];

const OPENCLAW_RAW_BASE =
  'https://raw.githubusercontent.com/openclaw/openclaw/main';

/**
 * Try to parse inputPrice, outputPrice, contextWindow from a raw TS provider file.
 * This is a best-effort regex parse — not full TS parsing.
 */
function parseProviderFile(content: string, provider: string): Partial<LLMModel>[] {
  const results: Partial<LLMModel>[] = [];
  // Match model object blocks: { id: "...", ... inputPrice: N, outputPrice: N, ... }
  const modelBlockRe =
    /\{\s*id:\s*["']([^"']+)["'][^}]*?inputPrice:\s*([\d.]+)[^}]*?outputPrice:\s*([\d.]+)(?:[^}]*?contextWindow:\s*(\d+))?/gs;
  let match;
  while ((match = modelBlockRe.exec(content)) !== null) {
    const [, id, inputPrice, outputPrice, contextWindow] = match;
    results.push({
      id,
      provider,
      inputPrice: parseFloat(inputPrice),
      outputPrice: parseFloat(outputPrice),
      contextWindow: contextWindow ? parseInt(contextWindow, 10) : null,
    });
  }
  return results;
}

/**
 * Merge partial data from GitHub on top of the static fallback dataset.
 */
function mergeWithStatic(partials: Partial<LLMModel>[]): LLMModel[] {
  const merged = [...staticModels];
  for (const partial of partials) {
    const idx = merged.findIndex((m) => m.id === partial.id);
    if (idx >= 0) {
      merged[idx] = {
        ...merged[idx],
        ...(partial.inputPrice != null ? { inputPrice: partial.inputPrice } : {}),
        ...(partial.outputPrice != null ? { outputPrice: partial.outputPrice } : {}),
        ...(partial.contextWindow != null ? { contextWindow: partial.contextWindow } : {}),
      };
    }
  }
  return merged;
}

function loadCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function saveCache(entry: CacheEntry) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage quota errors
  }
}

export function useModels() {
  const [models, setModels] = useState<LLMModel[]>(staticModels);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'github' | 'static'>('static');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFromGitHub = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPartials: Partial<LLMModel>[] = [];
      await Promise.allSettled(
        PROVIDER_FILES.map(async (file) => {
          const url = `${OPENCLAW_RAW_BASE}/${file}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) return;
          const text = await res.text();
          const providerName = file.split('/').pop()!.replace('.ts', '').replace('-shared', '');
          const partials = parseProviderFile(text, providerName);
          fetchedPartials.push(...partials);
        }),
      );

      if (fetchedPartials.length > 0) {
        const merged = mergeWithStatic(fetchedPartials);
        const entry: CacheEntry = { data: merged, timestamp: Date.now(), source: 'github' };
        saveCache(entry);
        setModels(merged);
        setDataSource('github');
        setLastUpdated(new Date());
      } else {
        // GitHub returned data but no parseable models — use static
        const entry: CacheEntry = { data: staticModels, timestamp: Date.now(), source: 'static' };
        saveCache(entry);
        setDataSource('static');
        setLastUpdated(new Date());
      }
    } catch {
      // Network error / rate limited — use static
      setDataSource('static');
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setModels(cached.data);
      setDataSource(cached.source);
      setLastUpdated(new Date(cached.timestamp));
      return;
    }
    fetchFromGitHub();
  }, [fetchFromGitHub]);

  return { models, loading, dataSource, lastUpdated, refresh: fetchFromGitHub };
}
