import { useState } from 'react';
import type { FilterState } from '@/hooks/useFilters';
import type { Region } from '@/data/models';
import { getProviders } from '@/data/models';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RotateCcw, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  resetFilters: () => void;
  toggleProvider: (p: string) => void;
  toggleRegion: (r: Region) => void;
}

const REGIONS: { key: Region; flag: string; label: string }[] = [
  { key: 'global', flag: '🌐', label: 'Global' },
  { key: 'china', flag: '🇨🇳', label: 'China' },
  { key: 'eu', flag: '🇪🇺', label: 'EU' },
];

export function FilterSidebar({
  filters,
  setFilters,
  resetFilters,
  toggleProvider,
  toggleRegion,
}: FilterSidebarProps) {
  const { strings } = useT();
  const providers = getProviders();
  const [showAllProviders, setShowAllProviders] = useState(false);
  const displayProviders = showAllProviders ? providers : providers.slice(0, 8);

  const isDefault =
    filters.providers.length === 0 &&
    filters.regions.length === 0 &&
    !filters.releaseDateFrom &&
    !filters.releaseDateTo &&
    filters.inputPriceMax === 100 &&
    filters.outputPriceMax === 100;

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{strings.filterTitle}</h2>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {strings.filterReset}
          </Button>
        )}
      </div>

      {/* Provider */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {strings.filterProvider}
        </Label>
        <div className="flex flex-col gap-1.5">
          {displayProviders.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.providers.includes(p)}
                onCheckedChange={() => toggleProvider(p)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {p}
              </span>
            </label>
          ))}
        </div>
        {providers.length > 8 && (
          <button
            className="text-xs text-primary hover:text-primary/80 text-left flex items-center gap-1"
            onClick={() => setShowAllProviders((v) => !v)}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showAllProviders ? 'rotate-180' : ''}`} />
            {showAllProviders ? 'Show less' : `+${providers.length - 8} more`}
          </button>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Region */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {strings.filterRegion}
        </Label>
        <div className="flex flex-col gap-1.5">
          {REGIONS.map(({ key, flag, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.regions.includes(key)}
                onCheckedChange={() => toggleRegion(key)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {flag} {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Release Date */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {strings.filterReleaseDate}
        </Label>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 text-xs justify-start font-normal gap-1.5',
                  !filters.releaseDateFrom && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="h-3 w-3" />
                {filters.releaseDateFrom
                  ? format(filters.releaseDateFrom, 'yyyy-MM-dd')
                  : strings.dateFrom}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.releaseDateFrom ?? undefined}
                onSelect={(d) => setFilters({ ...filters, releaseDateFrom: d ?? null })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 text-xs justify-start font-normal gap-1.5',
                  !filters.releaseDateTo && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="h-3 w-3" />
                {filters.releaseDateTo
                  ? format(filters.releaseDateTo, 'yyyy-MM-dd')
                  : strings.dateTo}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.releaseDateTo ?? undefined}
                onSelect={(d) => setFilters({ ...filters, releaseDateTo: d ?? null })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Input Price */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {strings.filterInputPrice}
          </Label>
          <span className="text-xs text-primary font-medium">
            {filters.inputPriceMax >= 100 ? '∞' : `≤ $${filters.inputPriceMax}`}
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={0.5}
          value={[filters.inputPriceMax]}
          onValueChange={([v]) => setFilters({ ...filters, inputPriceMax: v })}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>$0</span>
          <span>$100+</span>
        </div>
      </div>

      {/* Output Price */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {strings.filterOutputPrice}
          </Label>
          <span className="text-xs text-primary font-medium">
            {filters.outputPriceMax >= 100 ? '∞' : `≤ $${filters.outputPriceMax}`}
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={0.5}
          value={[filters.outputPriceMax]}
          onValueChange={([v]) => setFilters({ ...filters, outputPriceMax: v })}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>$0</span>
          <span>$100+</span>
        </div>
      </div>
    </aside>
  );
}
