
## Understanding the Project

**openclaw** (github.com/openclaw/openclaw) is a major open-source AI orchestration platform (278k stars). It has model/provider data distributed across TypeScript source files in `src/providers/` (e.g., openai.ts, google-shared.ts, etc.) and config files. The data includes: model IDs, context sizes, capabilities (vision/audio/tools), and pricing (inputPrice/outputPrice per token).

**Key constraint**: GitHub rate-limits unauthenticated raw file fetches aggressively. Real-time scraping from the browser/frontend won't be viable for every page load. The best approach is a **fetch-on-demand with localStorage cache** (1-hour TTL), calling the GitHub raw API from the frontend.

---

## Architecture

```
User Browser
  ├── App Shell (React)
  │   ├── HomePage (model list + filter sidebar)
  │   ├── ModelCard (individual card with select/compare button)
  │   └── CompareView (up to 4 model cards side-by-side)
  │
  ├── Data Layer
  │   ├── useGitHubModels hook
  │   │   ├── Fetch raw provider TS files via GitHub Contents API
  │   │   ├── Parse model entries (regex)
  │   │   └── localStorage cache (1-hour TTL)
  │   └── modelData.ts (static fallback dataset for known models)
  │
  └── State
      ├── filters (dateRange, region, inputPrice, outputPrice)
      ├── selectedModels[] (max 4 for comparison)
      └── language toggle (zh/en)
```

---

## Data Strategy

**Primary**: Fetch key provider files from `raw.githubusercontent.com`:
- `src/providers/openai.ts` → OpenAI models
- `src/providers/google-shared.ts` → Google/Gemini models  
- `src/providers/kilocode-shared.ts` → Kilocode
- and similar per-provider files

Parse TypeScript source with regex to extract:
- `inputPrice`, `outputPrice` ($/M tokens)
- `contextWindow`
- `supportsImages`, `supportsAudio`, `supportsTools`

**Fallback**: A curated static dataset (20-30 major models from OpenAI, Anthropic, Google, Mistral, Qwen, DeepSeek, etc.) with:
- `modelId`, `name`, `provider`
- `inputPrice`, `outputPrice` ($/M tokens)
- `contextWindow`
- `releasedAt` (date)
- `region` (global / China / EU)
- `apiDocsUrl` (official API signup page)
- `capabilities`: `{ vision, audio, tools, streaming }`

The static fallback ensures the app always works even when GitHub rate-limits apply.

---

## Pages & Components

### 1. `src/pages/Index.tsx` — Main Page
- Top header: title in zh/en, language toggle button
- Left sidebar: filter panel
  - Release date range (start/end date picker)
  - Region multi-select (Global, China, EU)
  - Input price range slider ($/M tokens)
  - Output price range slider ($/M tokens)
  - Provider multi-select checkboxes
- Main area: model card grid (responsive 2-4 columns)
- Floating compare bar at bottom: shows selected count + "Compare" button

### 2. `src/pages/Compare.tsx` — Comparison Page
- Back button
- Up to 4 model cards side-by-side
- Comparison dimensions:
  - Input price ($/M tokens) — highlighted cheapest
  - Output price ($/M tokens) — highlighted cheapest
  - Context window (tokens)
  - Release date
  - API capabilities (vision / audio / tools / streaming) — checkmark badges
  - API apply link + tutorial link

### 3. Components
- `src/components/ModelCard.tsx` — card showing model name, provider, prices, context, badges, select checkbox
- `src/components/FilterSidebar.tsx` — filter controls
- `src/components/CompareBar.tsx` — sticky bottom bar with selected models
- `src/components/LanguageToggle.tsx` — zh/en switch
- `src/data/models.ts` — static model dataset (fallback + enrichment)
- `src/hooks/useModels.ts` — data fetching + parsing + caching hook
- `src/hooks/useFilters.ts` — filter state management

---

## Files to Create/Edit

1. `src/data/models.ts` — static model dataset (40+ models)
2. `src/hooks/useModels.ts` — fetch, parse, cache logic
3. `src/hooks/useFilters.ts` — filter + comparison state
4. `src/components/ModelCard.tsx`
5. `src/components/FilterSidebar.tsx`
6. `src/components/CompareBar.tsx`
7. `src/components/LanguageToggle.tsx`
8. `src/pages/Index.tsx` — rewrite
9. `src/pages/Compare.tsx` — new page
10. `src/App.tsx` — add /compare route

---

## Static Model Dataset (Sample)

The curated list will include:

| Provider | Models |
|---|---|
| OpenAI | gpt-4o, gpt-4o-mini, o1, o3-mini |
| Anthropic | claude-3-7-sonnet, claude-3-5-haiku |
| Google | gemini-2.0-flash, gemini-2.5-pro |
| DeepSeek | deepseek-chat, deepseek-reasoner |
| Qwen | qwen-plus, qwen-max |
| Mistral | mistral-large, codestral |
| Meta | llama-3.3-70b |
| xAI | grok-3, grok-3-mini |
| MiniMax | minimax-m2.5 |
| Cohere | command-r-plus |

Each entry includes pricing, context, release date, region, API docs URL, and capabilities.

---

## Bilingual Support

All UI strings stored in a `i18n` object with `zh` and `en` keys. Language state stored in `localStorage`. No external i18n library needed — simple object lookup.

---

## Technical Notes

- No backend/Supabase needed — pure frontend with GitHub raw API + localStorage cache
- GitHub rate limit for unauthenticated requests: 60/hour — the static fallback ensures the app never breaks
- Comparison state passed via URL query params (`?compare=gpt-4o,claude-3-7-sonnet`) so links are shareable
- Recharts radar chart on the compare page for visual capability comparison
