import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { staticModels } from '@/data/models';
import type { LLMModel } from '@/data/models';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  ArrowLeft, ExternalLink, Eye, Mic, Wrench,
  Zap, Brain, Code2, Check, X, BrainCircuit, Layers, Calendar,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { format } from 'date-fns';

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10b981',
  Anthropic: '#f97316',
  Google: '#3b82f6',
  DeepSeek: '#6366f1',
  Alibaba: '#eab308',
  Mistral: '#8b5cf6',
  Meta: '#0ea5e9',
  xAI: '#94a3b8',
  MiniMax: '#ec4899',
  Cohere: '#14b8a6',
  Baidu: '#ef4444',
  Zhipu: '#06b6d4',
  Moonshot: '#a855f7',
  '01.AI': '#84cc16',
  Amazon: '#f59e0b',
};

const CHART_COLORS = [
  '#38bdf8', '#f97316', '#10b981', '#a855f7',
];

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

interface CapRowProps {
  label: string;
  icon: React.ReactNode;
  models: LLMModel[];
  field: keyof LLMModel['capabilities'];
}

function CapRow({ label, icon, models, field }: CapRowProps) {
  return (
    <tr className="border-b border-border/40">
      <td className="py-2.5 pr-4 text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </td>
      {models.map((m) => (
        <td key={m.id} className="py-2.5 text-center">
          {m.capabilities[field] ? (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary">
              <Check className="h-3 w-3" />
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted/60 text-muted-foreground/50">
              <X className="h-3 w-3" />
            </span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default function Compare() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { strings } = useT();

  const ids = (params.get('models') || '').split(',').filter(Boolean).slice(0, 4);
  const models = useMemo(
    () => ids.map((id) => staticModels.find((m) => m.id === id)).filter(Boolean) as LLMModel[],
    [ids],
  );

  // Find cheapest for each price metric
  const minInput = Math.min(...models.map((m) => m.inputPrice ?? Infinity));
  const minOutput = Math.min(...models.map((m) => m.outputPrice ?? Infinity));
  const maxContext = Math.max(...models.map((m) => m.contextWindow ?? 0));

  // Radar chart data
  const radarData = [
    { subject: strings.vision, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.vision ? 1 : 0])) },
    { subject: strings.audio, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.audio ? 1 : 0])) },
    { subject: strings.tools, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.tools ? 1 : 0])) },
    { subject: strings.streaming, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.streaming ? 1 : 0])) },
    { subject: strings.reasoning, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.reasoning ? 1 : 0])) },
    { subject: strings.functionCalling, ...Object.fromEntries(models.map((m, i) => [`m${i}`, m.capabilities.functionCalling ? 1 : 0])) },
  ];

  if (models.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">No models selected</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {strings.backToList}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {strings.backToList}
          </Button>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold text-foreground">{strings.compareTitle}</h1>
          </div>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Model Headers */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${models.length}, 1fr)` }}>
          <div />
          {models.map((m, i) => {
            const color = PROVIDER_COLORS[m.provider] || '#94a3b8';
            return (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
                style={{ borderTopColor: color, borderTopWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{m.name}</h2>
                    <p className="text-xs text-muted-foreground">{m.providerLabel}</p>
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i] }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.region.map((r) => (
                    <Badge key={r} variant="outline" className="text-[9px] h-4 px-1 border-border/50">
                      {r === 'global' ? '🌐' : r === 'china' ? '🇨🇳' : '🇪🇺'}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-auto">
                  <Button asChild variant="outline" size="sm" className="flex-1 h-6 text-[10px] gap-1 p-0 px-2">
                    <a href={m.apiDocsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-2.5 w-2.5" />
                      Docs
                    </a>
                  </Button>
                  {m.tutorialUrl && (
                    <Button asChild size="sm" className="flex-1 h-6 text-[10px] p-0 px-2">
                      <a href={m.tutorialUrl} target="_blank" rel="noopener noreferrer">
                        API Key
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              💰 {strings.inputPrice} & {strings.outputPrice}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* Input Price */}
                <tr className="border-b border-border/40">
                  <td className="py-3 px-5 text-xs text-muted-foreground w-44">{strings.inputPrice}</td>
                  {models.map((m) => (
                    <td key={m.id} className="py-3 px-5 text-center">
                      <span
                        className={`text-sm font-bold ${
                          m.inputPrice === minInput && m.inputPrice !== null
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {formatPrice(m.inputPrice)}
                      </span>
                      <div className="text-[9px] text-muted-foreground">{strings.perMTokens}</div>
                      {m.inputPrice === minInput && m.inputPrice !== null && (
                        <Badge className="text-[9px] h-4 px-1.5 mt-1 bg-primary/20 text-primary border-primary/30">
                          {strings.cheapest}
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>
                {/* Output Price */}
                <tr className="border-b border-border/40">
                  <td className="py-3 px-5 text-xs text-muted-foreground">{strings.outputPrice}</td>
                  {models.map((m) => (
                    <td key={m.id} className="py-3 px-5 text-center">
                      <span
                        className={`text-sm font-bold ${
                          m.outputPrice === minOutput && m.outputPrice !== null
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {formatPrice(m.outputPrice)}
                      </span>
                      <div className="text-[9px] text-muted-foreground">{strings.perMTokens}</div>
                      {m.outputPrice === minOutput && m.outputPrice !== null && (
                        <Badge className="text-[9px] h-4 px-1.5 mt-1 bg-primary/20 text-primary border-primary/30">
                          {strings.cheapest}
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>
                {/* Context */}
                <tr className="border-b border-border/40">
                  <td className="py-3 px-5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {strings.contextWindow}
                  </td>
                  {models.map((m) => (
                    <td key={m.id} className="py-3 px-5 text-center">
                      <span
                        className={`text-sm font-bold ${
                          m.contextWindow === maxContext && m.contextWindow !== null
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {formatContext(m.contextWindow)}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Release Date */}
                <tr>
                  <td className="py-3 px-5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {strings.releaseDate}
                  </td>
                  {models.map((m) => (
                    <td key={m.id} className="py-3 px-5 text-center">
                      <span className="text-sm text-foreground">
                        {m.releasedAt ? format(new Date(m.releasedAt), 'yyyy-MM-dd') : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Capabilities Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              ⚡ {strings.capabilities}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full px-5">
              <tbody className="px-5">
                <tr className="border-b border-border/40">
                  <td className="py-2 px-5 w-44" />
                  {models.map((m, i) => (
                    <td key={m.id} className="py-2 px-5 text-center">
                      <span className="text-[10px] font-medium" style={{ color: CHART_COLORS[i] }}>
                        {m.name}
                      </span>
                    </td>
                  ))}
                </tr>
                {[
                  { label: strings.vision, icon: <Eye className="h-3 w-3" />, field: 'vision' as const },
                  { label: strings.audio, icon: <Mic className="h-3 w-3" />, field: 'audio' as const },
                  { label: strings.tools, icon: <Wrench className="h-3 w-3" />, field: 'tools' as const },
                  { label: strings.streaming, icon: <Zap className="h-3 w-3" />, field: 'streaming' as const },
                  { label: strings.reasoning, icon: <Brain className="h-3 w-3" />, field: 'reasoning' as const },
                  { label: strings.functionCalling, icon: <Code2 className="h-3 w-3" />, field: 'functionCalling' as const },
                ].map(({ label, icon, field }) => (
                  <CapRow key={field} label={label} icon={icon} models={models} field={field} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              📊 {strings.capabilities} — Radar
            </h3>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                {models.map((m, i) => (
                  <Radar
                    key={m.id}
                    name={m.name}
                    dataKey={`m${i}`}
                    stroke={CHART_COLORS[i]}
                    fill={CHART_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
