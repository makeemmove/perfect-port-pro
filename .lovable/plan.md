

## Make News Draggable + Full AI News Desk Automation

### Part 1: Make News Section a Draggable Widget on Home

Currently the news preview on the home page is rendered outside the DndContext as static HTML. It needs to become a draggable widget like all the others.

**`src/components/dashboard/HomeTab.tsx`**
- Add `'news'` to the `DEFAULT_ORDER` array (e.g. `['stats', 'coming-up', 'weather', 'srta', 'mbta', 'news']`)
- Update the `loadOrder` validation to handle the new 6-item array
- Create a `NewsPreviewWidget` entry in the `widgetMap` that renders the existing 3-article preview cards + "View All News" button
- Remove the standalone news preview section below the DndContext (lines 226-258)
- The news widget will now be draggable and reorderable with the rest

### Part 2: Database -- Create `articles` Table

Create a migration with a new `articles` table to store AI-rewritten news:

```text
articles
  id           uuid (PK, default gen_random_uuid())
  source_url   text (unique -- used for dedup)
  source_name  text
  title        text
  content      text (the full AI-rewritten article body)
  summary      text (1-2 sentence summary)
  original_title text
  image_url    text (nullable)
  status       text (default 'published')
  published_at timestamptz
  created_at   timestamptz (default now())
```

- RLS: Enable RLS, add a SELECT policy allowing anon/authenticated to read all rows
- No INSERT/UPDATE/DELETE policies for public users (only the edge function using service role key will write)

### Part 3: Rewrite the Edge Function -- Full AI News Desk

**`supabase/functions/fetch-news/index.ts`** -- Major rewrite

The function will:
1. Scrape RSS feeds from Fall River Reporter, Herald News, Google News (same as now)
2. For each article, check `articles` table by `source_url` -- skip if exists
3. For new articles only, send the raw title + description to Gemini 3 Flash with the Senior News Editor prompt:
   - Role: Senior News Editor for a high-end digital publication
   - Task: Rewrite into a full 400-800 word professional article
   - Style: Neutral, authoritative, engaging. No AI-isms. Active voice
   - Structure: Catchy headline, strong lede, subheadings (H2/H3)
   - SEO: Integrate primary keywords from original
   - Output via tool calling: `title`, `content` (full article), `summary` (1-2 sentences)
4. Insert new articles into `articles` table with status='published'
5. Return the latest 15 articles from the table (not just scraped ones)

The function will use the Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) to write to the articles table, and use `LOVABLE_API_KEY` for the AI gateway.

### Part 4: Set Up pg_cron for 5-Minute Auto-Refresh

- Enable `pg_cron` and `pg_net` extensions via migration
- Schedule a cron job that calls the `fetch-news` edge function every 5 minutes using `net.http_post`

### Part 5: Update Frontend to Read from Database

**`src/hooks/useNews.ts`**
- Change from calling the edge function directly to querying the `articles` table via Supabase client
- Still refresh every 5 minutes on the client side, but now reads from the DB (which is populated by the cron job)
- The `NewsArticle` interface gets a `content` field for the full article body

**`src/components/dashboard/NewsTab.tsx`**
- Update cards to show the AI-rewritten title and summary
- When clicking an article, show a modal/expanded view with the full `content` (rendered as HTML with H2/H3 subheadings) instead of opening an external link
- Keep the external link as a secondary "View Original" action

### Part 6: News Widget Preview on Home

**`src/components/dashboard/widgets/NewsPreviewWidget.tsx`** (new file)
- A compact widget showing 3 latest article titles from the `articles` table
- "View All News" button that triggers `onNewsClick`
- Styled consistently with other widgets (card, border, shadow)

---

### Technical Details: Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboard/HomeTab.tsx` | Modify | Add 'news' to widget order, move news preview into widgetMap |
| `src/components/dashboard/widgets/NewsPreviewWidget.tsx` | Create | Compact news preview widget for the draggable grid |
| `supabase/functions/fetch-news/index.ts` | Rewrite | Full AI news desk: scrape, dedup against DB, rewrite with Gemini, save to articles table |
| `src/hooks/useNews.ts` | Modify | Read from articles table instead of calling edge function directly |
| `src/components/dashboard/NewsTab.tsx` | Modify | Show full AI-rewritten articles with expanded view |
| Migration | Create | `articles` table with RLS, `pg_cron` + `pg_net` extensions, cron schedule |

### Technical Details: AI Prompt (Edge Function)

The Gemini 3 Flash call will use tool calling to extract structured output:

- Tool name: `write_article`
- Parameters: `title` (string), `content` (string, full article 400-800 words with markdown H2/H3), `summary` (string, 1-2 sentences)
- System prompt includes all the Senior News Editor instructions from the request
- Each article is processed individually (not batched) to get full-length rewrites

### Technical Details: Cron Job

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule every 5 minutes
SELECT cron.schedule(
  'fetch-news-every-5-min',
  '*/5 * * * *',
  $$ SELECT net.http_post(
    url := 'https://qjyvkqvxzdbclytcdfdj.supabase.co/functions/v1/fetch-news',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id; $$
);
```

