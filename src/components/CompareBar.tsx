import type { LLMModel } from '@/data/models';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { X, GitCompareArrows } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompareBarProps {
  selectedModels: LLMModel[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-emerald-500/20 text-emerald-300',
  Anthropic: 'bg-orange-500/20 text-orange-300',
  Google: 'bg-blue-500/20 text-blue-300',
  DeepSeek: 'bg-indigo-500/20 text-indigo-300',
  Alibaba: 'bg-yellow-500/20 text-yellow-300',
  Mistral: 'bg-violet-500/20 text-violet-300',
  Meta: 'bg-sky-500/20 text-sky-300',
  xAI: 'bg-slate-500/20 text-slate-300',
};

export function CompareBar({ selectedModels, onRemove, onClear }: CompareBarProps) {
  const { strings } = useT();
  const navigate = useNavigate();

  if (selectedModels.length === 0) return null;

  const handleCompare = () => {
    const ids = selectedModels.map((m) => m.id).join(',');
    navigate(`/compare?models=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          {strings.selected} {selectedModels.length}/4 {strings.models}
          {selectedModels.length < 4 && (
            <span className="ml-2 text-xs text-muted-foreground/70">
              ({strings.maxModels})
            </span>
          )}
        </span>

        <div className="flex flex-wrap gap-2 flex-1">
          {selectedModels.map((m) => {
            const color = PROVIDER_COLORS[m.provider] || 'bg-muted text-muted-foreground';
            return (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
              >
                <span>{m.name}</span>
                <button
                  onClick={() => onRemove(m.id)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-8">
            {strings.clearSelection}
          </Button>
          <Button
            size="sm"
            onClick={handleCompare}
            disabled={selectedModels.length < 2}
            className="h-8 text-xs gap-1.5"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            {strings.compare}
          </Button>
        </div>
      </div>
    </div>
  );
}
