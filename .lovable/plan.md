

## Pixel-Perfect Premium Theme Adjustments

### 1. Darken Background to #F1F3F5

Update `src/index.css` CSS variable `--background` from the current `210 20% 98%` (approx #F9FAFB) to `210 14% 95%` (approx #F1F3F5). This creates the crucial contrast between the page background and pure white cards.

### 2. Deep Ambient Shadow

Update `tailwind.config.ts` `shadow-card` to the stronger spec:
```
"0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
```
Update `shadow-card-hover` proportionally stronger.

### 3. Ensure Strict 24px Corner Radius

Audit and fix any cards still using `rounded-[20px]` -- change all to `rounded-[24px]`:
- `SortableEventItem.tsx` (line 35): `rounded-[20px]` to `rounded-[24px]`
- `NewsPreviewWidget.tsx` preview cards: verify `rounded-[24px]`

### 4. Header: "Fall River" Black + "Connect" Blue

Already correct in `HomeTab.tsx` line 205: `Fall River <span className="text-primary">Connect</span>`. Bump to `text-3xl` and ensure `font-extrabold` for a heavier, more premium feel.

### 5. INFO Buttons: Pill-Shaped, Light Gray BG, Blue Text

Update the "Info" button in `SortableEventItem.tsx` (line 63) and "More Info" buttons in `EatsTab.tsx` and `EventsTab.tsx`:
- Change from `bg-foreground/5 text-foreground` to `bg-muted text-primary`
- Ensure `rounded-full` (already present)

### 6. Increase Card Padding

Add more internal breathing room to cards:
- `WeatherWidget.tsx`: `p-5` to `p-6`
- `StatsWidget.tsx`: `p-4` to `p-5`
- `SortableEventItem.tsx`: `py-2.5 px-3.5` to `py-3.5 px-4`
- `MbtaWidget.tsx` / `SrtaWidget.tsx`: `p-5` to `p-6`
- Event cards in `EventsTab.tsx`: `p-4` to `p-5`
- Restaurant cards in `EatsTab.tsx`: `p-4` to `p-5`
- News cards: increase padding similarly

### 7. Normalize All `active:scale` to `0.98`

Fix remaining `active:scale-[0.97]` in `StatsWidget.tsx` (lines 10, 25) to `active:scale-[0.98]`.

---

### Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Background to #F1F3F5 (`210 14% 95%`) |
| `tailwind.config.ts` | Stronger `shadow-card` and `shadow-card-hover` |
| `src/components/dashboard/HomeTab.tsx` | Header text size bump to `text-3xl` |
| `src/components/dashboard/widgets/SortableEventItem.tsx` | 24px radius, more padding, blue Info button |
| `src/components/dashboard/widgets/StatsWidget.tsx` | More padding, fix scale to 0.98 |
| `src/components/dashboard/widgets/WeatherWidget.tsx` | Increase padding to p-6 |
| `src/components/dashboard/widgets/MbtaWidget.tsx` | Increase padding to p-6 |
| `src/components/dashboard/widgets/SrtaWidget.tsx` | Increase padding to p-6 |
| `src/components/dashboard/EventsTab.tsx` | More padding, blue Info button |
| `src/components/dashboard/EatsTab.tsx` | More padding, blue More Info button |
| `src/components/dashboard/NewsTab.tsx` | Increase card padding |
| `src/components/dashboard/widgets/NewsPreviewWidget.tsx` | Ensure 24px radius, increase padding |
