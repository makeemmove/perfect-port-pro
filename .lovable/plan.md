

## UI Polish, Data Reset, and News Regeneration

### 1. Clear Articles and Trigger Fresh Fetch

Delete all existing articles from the database, then call the `fetch-news` edge function to regenerate them with the new 100-character teaser prompt.

- SQL: `DELETE FROM articles;`
- Then invoke `fetch-news` to scrape and rewrite with the updated Gemini prompt

### 2. Card Depth: Shadow and 20px Rounded Corners

Add a pronounced shadow and `rounded-[20px]` to all Event and News cards.

**EventsTab.tsx (line 106):** Change event cards from `rounded-xl` to `rounded-[20px]` and ensure `shadow-card hover:shadow-card-hover` is present.

**NewsTab.tsx:**
- Featured card (line 51): already has `rounded-2xl shadow-card` -- update to `rounded-[20px]`
- NewsCard (line 117): change `rounded-2xl` to `rounded-[20px]`, add `shadow-card`

**NewsPreviewWidget.tsx (line 23):** Change preview cards from `rounded-xl` to `rounded-[20px]`, add `shadow-card`

### 3. Dynamic Ticker Color by Category

Update `Ticker.tsx` to assign each ticker item a category and color the bullet/arrow marker accordingly:
- Red for breaking/urgent news items
- Purple for events/festivals
- Blue for community/civic items
- Green for education/library items

Add a `category` field to each ticker item and use a color map to set the marker color dynamically instead of the static `text-primary`.

### 4. Micro-Interactions: Hover/Tap Scale Effect

Add `active:scale-[0.98] hover:scale-[1.01] transition-transform duration-150` to all interactive cards:

- **EventsTab.tsx** event cards (line 106)
- **NewsTab.tsx** featured card (line 51) and NewsCard (line 117)
- **NewsPreviewWidget.tsx** preview cards (line 23)

This gives a subtle press-in feel on tap and a slight lift on hover.

---

### Files Changed

| File | Change |
|------|--------|
| Database | DELETE all articles, then trigger fresh fetch |
| `src/components/dashboard/Ticker.tsx` | Add category-based color to each ticker item marker |
| `src/components/dashboard/EventsTab.tsx` | 20px radius, shadow, scale micro-interaction on cards |
| `src/components/dashboard/NewsTab.tsx` | 20px radius, shadow, scale micro-interaction on cards |
| `src/components/dashboard/widgets/NewsPreviewWidget.tsx` | 20px radius, shadow, scale micro-interaction on cards |

