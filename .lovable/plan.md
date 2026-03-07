

# Plan: Make MBTA Status Badge Larger and Always Visible

## Problem
The `TopStatusBadge` returns `null` when `nextTrainStatus` is `undefined` — which happens when no trains remain or when the API hasn't returned data yet. This means nothing renders in the top-right corner. Additionally, the badge text is only `10px`, making it hard to see.

## Changes

### `src/components/dashboard/widgets/MbtaWidget.tsx`

**TopStatusBadge component (lines 38-53):**
- Remove the early `return null` for undefined status — instead show a default "Scheduled" badge as fallback when status is undefined
- Increase text size from `text-[10px]` to `text-[13px]` across all badge variants
- Increase padding from `px-2.5 py-1` to `px-3.5 py-1.5`
- Add `font-bold` consistently and `shadow-sm` for visual pop

**Badge container (line 78-80):**
- No structural change needed — the `ml-auto` div already positions it top-right

### Result
The badge will always show something: "On Time" (green), "X min Late" (red), "X min Early" (blue), "Scheduled" (amber), or "CANCELLED" (red) — and it will be noticeably larger at ~13px with more padding.

