

## Plan: Fix CSS Build Error + Edit Mode Tabs + Full News Rewrite System

There are three distinct pieces of work here.

---

### 1. Fix CSS Build Error

**`src/index.css`** — The error is "Unexpected `}` at line 145". Looking at the current file, the CSS appears structurally valid now (the code shown has matching braces). However, there may be a stray `}` from a previous bad edit that got cached. I'll rewrite the full CSS file to ensure no orphan braces exist.

---

### 2. Edit Mode: Add Tab Controls to Top-Right Corner

**Problem:** Dragging widgets triggers copy/paste on mobile. 
**Solution:** Instead of making the entire card surface draggable, add explicit drag handle tabs (grip icons) that appear in the top-right corner of each card ONLY when edit mode is active. This avoids the long-press/copy-paste conflict entirely.

**`src/components/dashboard/SortableWidgetItem.tsx`**:
- When `isEditMode` is true, render a visible **drag handle tab** (grip/move icon) in the top-right corner of the card
- Only attach `...listeners` and `...attributes` to the drag handle element, NOT the entire card
- Remove the `touchstart` preventDefault hack (no longer needed since only the handle is draggable)
- Keep `contextmenu` prevention on the handle only

**`src/components/dashboard/HomeTab.tsx`**:
- Remove the `is-edit-mode` class from the container (no longer needed)
- Keep the jiggle animation and overlay

**`src/index.css`**:
- Remove the nuclear `.is-edit-mode` rules (no longer needed)
- Keep `.jiggle`, `.widget-lifted`, `.edit-overlay`

---

### 3. News System: Full Article Rewrite (300-500 words, no external links)

**`supabase/functions/fetch-news/index.ts`** — Major changes to the AI prompt and output:

- **New prompt**: Instruct Gemini to write a **strong, attention-grabbing headline** and a **full 300-500 word article** in its own words. No direct quotes from original. No external links. Written as original journalism based on the scraped facts.
- **Tool schema update**: Change `summary` field to `article` with description "Full article: 300-500 words, original writing, no external links"
- **DB insert**: Store the full article in `content` field, and a short 1-sentence summary (first sentence of article) in `summary` field
- **Trigger rewrite of existing articles**: Add a query param `?rewrite=true` that deletes all existing articles and re-fetches/rewrites them fresh

**`src/components/dashboard/NewsTab.tsx`**:
- In the article modal, display the full `content` field (the 300-500 word article) instead of just the summary
- Remove the "Read Full Story" external link button entirely
- Show the full article text with proper paragraph formatting

**`src/components/dashboard/widgets/NewsPreviewWidget.tsx`**:
- Keep showing just the title + first-line summary in the home widget (no changes needed)

**`src/hooks/useNews.ts`**:
- Add a `rewriteAll` function that calls `fetch-news` with `?rewrite=true` to trigger fresh rewrites

---

### Files to create/edit
1. `src/index.css` — Fix stray brace, remove nuclear edit-mode CSS
2. `src/components/dashboard/SortableWidgetItem.tsx` — Add drag handle tab in top-right
3. `src/components/dashboard/HomeTab.tsx` — Remove is-edit-mode class
4. `supabase/functions/fetch-news/index.ts` — Full article rewrite prompt (300-500 words), no external links
5. `src/components/dashboard/NewsTab.tsx` — Show full article content, remove external link
6. `src/hooks/useNews.ts` — Add rewriteAll function

