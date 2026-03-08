import type { LLMModel } from '@/data/models';
import { useT } from '@/hooks/useT';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye, Mic, Wrench, Zap, Brain, Code2,
  ExternalLink, Calendar, Layers,
} from 'lucide-react';
import { format } from 'date-fns';

interface ModelCardProps {
  model: LLMModel;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  selectionFull: boolean; // 4 already selected and this isn't one of them
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Anthropic: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Google: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  DeepSeek: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Alibaba: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Mistral: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Meta: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  xAI: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  MiniMax: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Cohere: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Baidu: 'bg-red-500/15 text-red-400 border-red-500/30',
  Zhipu: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Moonshot: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  '01.AI': 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  Amazon: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

function formatPrice(p: number | null): string {
  if (p === null) return '—';
  if (p === 0) return 'Free';
  if (p < 0.01) return `$${p.toFixed(4)}`;
  if (p < 1) return `$${p.toFixed(3)}`;
  return `$${p.toFixed(2)}`;
}

function formatContext(ctx: number | null): string {
  if (ctx === null) return '—';
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(1)}M`;
  return `${Math.round(ctx / 1000)}K`;
}

const CAP_ICONS = [
  { key: 'vision', Icon: Eye, label: 'Vision' },
  { key: 'audio', Icon: Mic, label: 'Audio' },
  { key: 'tools', Icon: Wrench, label: 'Tools' },
  { key: 'streaming', Icon: Zap, label: 'Stream' },
  { key: 'reasoning', Icon: Brain, label: 'Reason' },
  { key: 'functionCalling', Icon: Code2, label: 'Fn' },
] as const;

export function ModelCard({ model, selected, onToggleSelect, selectionFull }: ModelCardProps) {
  const { strings } = useT();
  const providerColor = PROVIDER_COLORS[model.provider] || 'bg-muted text-muted-foreground border-border';
  const disabled = !selected && selectionFull;

  return (
    <Card
      className={`relative flex flex-col gap-0 overflow-hidden transition-all duration-200 border ${
        selected
          ? 'border-primary/70 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] bg-primary/5'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {/* Select checkbox overlay */}
      <div className="absolute top-3 right-3 z-10">
        <Checkbox
          checked={selected}
          disabled={disabled}
          onCheckedChange={() => onToggleSelect(model.id)}
          className="h-4 w-4"
        />
      </div>

      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-2 pr-6">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight text-foreground truncate">{model.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit ${providerColor}`}>
              {model.providerLabel}
            </span>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted/50 px-2.5 py-2">
            <div className="text-[10px] text-muted-foreground mb-0.5">{strings.inputPrice}</div>
            <div className="text-sm font-bold text-foreground">{formatPrice(model.inputPrice)}</div>
            <div className="text-[9px] text-muted-foreground">{strings.perMTokens}</div>
          </div>
          <div className="rounded-md bg-muted/50 px-2.5 py-2">
            <div className="text-[10px] text-muted-foreground mb-0.5">{strings.outputPrice}</div>
            <div className="text-sm font-bold text-foreground">{formatPrice(model.outputPrice)}</div>
            <div className="text-[9px] text-muted-foreground">{strings.perMTokens}</div>
          </div>
        </div>

        {/* Context + Release */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {formatContext(model.contextWindow)}
          </span>
          {model.releasedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(model.releasedAt), 'yyyy-MM')}
            </span>
          )}
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1">
          {CAP_ICONS.map(({ key, Icon, label }) => {
            const active = model.capabilities[key as keyof typeof model.capabilities];
            return (
              <span
                key={key}
                title={label}
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${
                  active
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted/30 text-muted-foreground/50 border-border/50'
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {label}
              </span>
            );
          })}
        </div>

        {/* Regions */}
        <div className="flex flex-wrap gap-1">
          {model.region.map((r) => (
            <Badge key={r} variant="outline" className="text-[10px] h-4 px-1.5 border-border/60">
              {r === 'global' ? '🌐' : r === 'china' ? '🇨🇳' : '🇪🇺'}{' '}
              {r === 'global' ? strings.regionGlobal : r === 'china' ? strings.regionChina : strings.regionEU}
            </Badge>
          ))}
        </div>

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-accent/50 text-accent-foreground border border-accent-foreground/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* API Link */}
        <div className="flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1">
            <a href={model.apiDocsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              {strings.apiDocs}
            </a>
          </Button>
          {model.tutorialUrl && (
            <Button asChild size="sm" className="flex-1 h-7 text-xs gap-1">
              <a href={model.tutorialUrl} target="_blank" rel="noopener noreferrer">
                {strings.applyApi}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
