

## Plan: Replace Arrow Buttons with Three-Dot Menu

Option 2 (three-dot menu) is the cleaner choice — it keeps cards completely uncluttered during normal use and only reveals reorder options on tap.

### Changes

#### `src/components/dashboard/DraggableWidget.tsx` — Rewrite
- Remove `ChevronUp` / `ChevronDown` arrow buttons
- Add a small `MoreVertical` (three-dot) icon button in the top-right corner (`absolute top-2 right-2`)
- Button: 28x28px, `bg-accent/10 text-muted-foreground`, subtle and unobtrusive
- On click, open a `DropdownMenu` (already available via `@radix-ui/react-dropdown-menu`) with two items:
  - "Move Up" (shown only if `onMoveUp` is provided)
  - "Move Down" (shown only if `onMoveDown` is provided)
- Each item uses `ChevronUp` / `ChevronDown` as inline icons
- Menu uses existing `DropdownMenuContent`, `DropdownMenuItem` components from `src/components/ui/dropdown-menu.tsx`

#### `src/components/dashboard/HomeTab.tsx` — No changes
- `moveWidget`, `onMoveUp`, `onMoveDown` props all stay exactly as they are

#### Everything else — Untouched
Layout, fonts, colors, spacing, card content, buttons — all unchanged.

### Result
Cards look clean by default. A single subtle dot-menu per card gives access to reorder without cluttering the UI.

