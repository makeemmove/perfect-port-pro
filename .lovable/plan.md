

## Premium Brand Theme Polish

Most of the requested styling is already in place. This plan addresses the remaining gaps to achieve full spec compliance.

### 1. Update Ambient Shadow (tailwind.config.ts)

Change the `shadow-card` value from the single-layer shadow to the exact dual-layer spec:
```
"0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)"
```
Also update `shadow-card-hover` to a slightly stronger version for hover states.

### 2. Normalize Scale Interaction to 0.98

The spec calls for `scale(0.98)` on tap/click. Several components currently use `active:scale-[0.97]`. Update all interactive cards and buttons to use `active:scale-[0.98]` consistently:

- `src/components/ui/button.tsx` (line 8)
- `src/components/dashboard/EventsTab.tsx` (cards + filter chips)
- `src/components/dashboard/EatsTab.tsx` (cards + filter chips)
- `src/components/dashboard/NewsTab.tsx` (featured card + news cards)
- `src/components/dashboard/widgets/NewsPreviewWidget.tsx` (preview cards + button)
- `src/components/dashboard/widgets/SortableEventItem.tsx` (event items)
- `src/components/dashboard/QuickViewModal.tsx` (visit website button)

### 3. Remove All Borders from Tag Badges

Remove `border border-*` classes from category/cuisine tag badges to create the borderless premium look:

- `src/components/dashboard/EventsTab.tsx` — `tagStyles` object (line 24-30): remove `border border-*` from each entry
- `src/components/dashboard/EatsTab.tsx` — `tagStyles` object (line 17-25): remove `border border-*` from each entry
- `src/components/dashboard/QuickViewModal.tsx` — tag badge (line 54): remove `border` class

### 4. Ensure Border-Free Cards Globally

Remove `border-t border-muted/60` dividers inside the WeatherWidget and replace with spacing or a very subtle `bg-muted/30` separator for a cleaner look:

- `src/components/dashboard/widgets/WeatherWidget.tsx` (lines 20, 25, 32): change `border-t border-muted/60` to a softer visual divider using `bg-muted/40 h-px` elements or just spacing

### 5. Verify Chevron Icons on All News Cards

Both `NewsTab.tsx` and `NewsPreviewWidget.tsx` already include `ChevronRight` icons on cards -- no changes needed here.

---

### Files Changed

| File | Change |
|------|--------|
| `tailwind.config.ts` | Update `shadow-card` to dual-layer ambient shadow |
| `src/components/ui/button.tsx` | `active:scale-[0.97]` to `active:scale-[0.98]` |
| `src/components/dashboard/EventsTab.tsx` | Remove tag borders, normalize scale to 0.98 |
| `src/components/dashboard/EatsTab.tsx` | Remove tag borders, normalize scale to 0.98 |
| `src/components/dashboard/NewsTab.tsx` | Normalize scale to 0.98 |
| `src/components/dashboard/widgets/NewsPreviewWidget.tsx` | Normalize scale to 0.98 |
| `src/components/dashboard/widgets/SortableEventItem.tsx` | Normalize scale to 0.98 |
| `src/components/dashboard/widgets/WeatherWidget.tsx` | Replace border dividers with subtle spacing |
| `src/components/dashboard/QuickViewModal.tsx` | Remove tag border, normalize scale to 0.98 |

