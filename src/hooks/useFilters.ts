import { useState, useCallback } from 'react';
import type { LLMModel, Region } from '@/data/models';

export interface FilterState {
  search: string;
  providers: string[];
  regions: Region[];
  releaseDateFrom: Date | null;
  releaseDateTo: Date | null;
  inputPriceMax: number;
  outputPriceMax: number;
}

const DEFAULT_MAX = 100;

export const defaultFilters: FilterState = {
  search: '',
  providers: [],
  regions: [],
  releaseDateFrom: null,
  releaseDateTo: null,
  inputPriceMax: DEFAULT_MAX,
  outputPriceMax: DEFAULT_MAX,
};

export function useFilters(models: LLMModel[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const toggleProvider = useCallback((provider: string) => {
    setFilters((f) => ({
      ...f,
      providers: f.providers.includes(provider)
        ? f.providers.filter((p) => p !== provider)
        : [...f.providers, provider],
    }));
  }, []);

  const toggleRegion = useCallback((region: Region) => {
    setFilters((f) => ({
      ...f,
      regions: f.regions.includes(region)
        ? f.regions.filter((r) => r !== region)
        : [...f.regions, region],
    }));
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 4) return prev; // max 4
        return [...prev, id];
      });
    },
    [],
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const filteredModels = models.filter((m) => {
    if (
      filters.search &&
      !m.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !m.provider.toLowerCase().includes(filters.search.toLowerCase()) &&
      !m.id.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.providers.length > 0 && !filters.providers.includes(m.provider)) {
      return false;
    }
    if (
      filters.regions.length > 0 &&
      !filters.regions.some((r) => m.region.includes(r))
    ) {
      return false;
    }
    if (filters.releaseDateFrom && m.releasedAt) {
      if (new Date(m.releasedAt) < filters.releaseDateFrom) return false;
    }
    if (filters.releaseDateTo && m.releasedAt) {
      if (new Date(m.releasedAt) > filters.releaseDateTo) return false;
    }
    if (
      m.inputPrice != null &&
      filters.inputPriceMax < DEFAULT_MAX &&
      m.inputPrice > filters.inputPriceMax
    ) {
      return false;
    }
    if (
      m.outputPrice != null &&
      filters.outputPriceMax < DEFAULT_MAX &&
      m.outputPrice > filters.outputPriceMax
    ) {
      return false;
    }
    return true;
  });

  const selectedModels = selectedIds
    .map((id) => models.find((m) => m.id === id))
    .filter(Boolean) as LLMModel[];

  return {
    filters,
    setFilters,
    resetFilters,
    toggleProvider,
    toggleRegion,
    filteredModels,
    selectedIds,
    selectedModels,
    toggleSelect,
    clearSelection,
  };
}
