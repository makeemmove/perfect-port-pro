

## Plan: Reorder Mode Toggle + Fall River-Only News

### 3 Changes

#### 1. `src/components/dashboard/widgets/StatsWidget.tsx`
- Replace the "Local Eats" card with a "Reorder" button card
- Same visual style (glass-card, icon, label) but toggles reorder mode instead of navigating to eats
- Add prop: `reorderMode: boolean`, `onToggleReorder: () => void`
- Keep the "Events This Week" card as-is
- Move the "Local Eats" navigation to the bottom nav (already exists as "Eats" tab)

**Wait** — the user said "where local eats is." Let me re-read: "have a button where local eats is that u can press to reorder." So the Local Eats stat card gets replaced with a Reorder toggle button.

- New card: icon (grid/move icon), label "Reorder", shows "Tap to edit" subtext. When `reorderMode` is true, shows "Done" state with accent highlight
- Props: add `reorderMode: boolean`, `onToggleReorder: () => void`

#### 2. `src/components/dashboard/HomeTab.tsx`
- Add `reorderMode` state (boolean, default false)
- Pass `reorderMode` and toggle callback to `StatsWidget`
- Only pass `onMoveUp`/`onMoveDown` to `DraggableWidget` when `reorderMode === true`
- When reorder mode is off, widgets render clean with no controls

#### 3. `src/components/dashboard/DraggableWidget.tsx`
- Keep the three-dot menu as-is (it already only shows when `onMoveUp`/`onMoveDown` are provided)
- No changes needed — it will naturally hide when HomeTab stops passing move callbacks

**Actually**, the user wants drag-and-drop when in reorder mode — "all of the cards have their own button to drag and drop up or down." This sounds like they still want up/down controls, just only visible in reorder mode. The three-dot menu approach works, but let me reconsider: they said "button to drag and drop up or down" — this means visible up/down arrows on each card, not a menu. Let me use simple arrow buttons that only appear in reorder mode.

#### Revised: `src/components/dashboard/DraggableWidget.tsx`
- Remove the three-dot dropdown menu entirely
- When `onMoveUp` or `onMoveDown` are provided (reorder mode on), show visible `ChevronUp`/`ChevronDown` arrow buttons on the card (top-right, accent-colored circles)
- When not provided (reorder mode off), render nothing — clean card

#### 4. `supabase/functions/fetch-news/index.ts`
- Update the system prompt to specify: "Only write about news specifically about Fall River, Massachusetts. Ignore articles about other Massachusetts cities or towns unless they directly impact Fall River."
- Update the Google News search query to be more specific: `"Fall River" Massachusetts` (with quotes) instead of `Fall+River+Massachusetts`
- Add a filtering instruction in the rewrite prompt so Gemini skips non-Fall River articles

### Files to edit
1. `src/components/dashboard/widgets/StatsWidget.tsx` — replace Local Eats card with Reorder toggle
2. `src/components/dashboard/HomeTab.tsx` — add reorderMode state, conditionally pass move props
3. `src/components/dashboard/DraggableWidget.tsx` — remove three-dot menu, show arrow buttons only when move props provided
4. `supabase/functions/fetch-news/index.ts` — tighten search query and prompt to Fall River only

