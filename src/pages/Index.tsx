import { useState } from 'react';
import { useModels } from '@/hooks/useModels';
import { useFilters } from '@/hooks/useFilters';
import { useT } from '@/hooks/useT';
import { ModelCard } from '@/components/ModelCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { CompareBar } from '@/components/CompareBar';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Index() {
  const { models, loading, dataSource, lastUpdated, refresh } = useModels();
  const { strings } = useT();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
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
  } = useFilters(models);

  const selectionFull = selectedIds.length >= 4;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground hidden sm:block">
              {strings.appTitle}
            </h1>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={strings.searchPlaceholder}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8 h-8 text-xs bg-muted/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Data source badge */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className={`text-[10px] h-5 px-2 border ${
                dataSource === 'github'
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {dataSource === 'github' ? strings.githubData : strings.staticData}
            </Badge>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="ml-auto shrink-0">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Subtitle bar */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-3">
          <p className="text-xs text-muted-foreground">{strings.appSubtitle}</p>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground">
            {strings.totalModels} <strong className="text-foreground">{filteredModels.length}</strong> {strings.modelsCount}
          </span>
          {loading && (
            <span className="text-xs text-primary animate-pulse">{strings.loadingGithub}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-5 flex gap-5">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center"
          style={{ zIndex: 30 }}
        />

        {/* Filter Sidebar */}
        {sidebarOpen && (
          <div className="hidden md:block">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              toggleProvider={toggleProvider}
              toggleRegion={toggleRegion}
            />
          </div>
        )}

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden md:flex items-center justify-center h-8 w-5 self-start mt-1 rounded border border-border/50 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {/* Model Grid */}
        <main className="flex-1 min-w-0">
          {loading && filteredModels.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">{strings.loading}</p>
              </div>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <Search className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">{strings.noResults}</p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                  {strings.filterReset}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selected={selectedIds.includes(model.id)}
                  onToggleSelect={toggleSelect}
                  selectionFull={selectionFull}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Compare Bar */}
      <CompareBar
        selectedModels={selectedModels}
        onRemove={toggleSelect}
        onClear={clearSelection}
      />

      {/* Bottom padding when compare bar is shown */}
      {selectedModels.length > 0 && <div className="h-16" />}
    </div>
  );
}
