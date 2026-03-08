import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { lang, setLang } = useT();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang('zh')}
        className={`h-7 px-3 text-xs rounded-md transition-all ${
          lang === 'zh'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        中文
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang('en')}
        className={`h-7 px-3 text-xs rounded-md transition-all ${
          lang === 'en'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </Button>
    </div>
  );
}
