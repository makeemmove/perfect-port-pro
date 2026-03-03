

# Shadow, Typography & Size Refinements

## 1. Directional "Lift" Shadows (tailwind.config.ts)

Replace the current `shadow-card` and `shadow-pill` values with the exact downward-shifted shadow spec:

- `shadow-card`: `0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.1)`
- `shadow-pill`: same value so Coming Up pills match the cards

## 2. Heavy Header (HomeTab.tsx)

Update the title so both "Fall River" and "Connect" use `fontWeight: 900`. Add `tracking-tighter` class and set `letterSpacing: '-0.05em'` (already present but confirm both words are weight 900).

## 3. Info Buttons Darker Blue (SortableEventItem.tsx)

Change the Info button text from `text-primary` to a darker blue (`text-blue-700`) so it pops more on white. Ensure `rounded-full` is applied (already is).

## 4. Compact Weather Widget (WeatherWidget.tsx)

Reduce padding from `p-6` to `p-4` and shrink the temperature text from `text-5xl` to `text-4xl`. Reduce the weather icon container from `w-14 h-14` / `text-[42px]` to `w-10 h-10` / `text-[32px]`. Tighten internal spacing (`mt-3 pt-3` to `mt-2 pt-2`). Shrink hourly forecast pill sizes (`min-w-[52px]` to `min-w-[46px]`, `py-2 px-2.5` to `py-1.5 px-2`).

## 5. Compact MBTA Widget (MbtaWidget.tsx)

Reduce padding from `p-6` to `p-4`. Shrink the countdown from `text-4xl` to `text-3xl`. Reduce vertical margins (`mb-3` to `mb-2`, `mt-3` to `mt-2`).

## 6. Ensure Background is Pure White (index.css)

Verify `--background` is set to pure white (`0 0% 100%`). No changes if already correct.

### Files to Edit
- `tailwind.config.ts` -- shadow values
- `src/components/dashboard/HomeTab.tsx` -- header weight
- `src/components/dashboard/widgets/WeatherWidget.tsx` -- compact sizing
- `src/components/dashboard/widgets/MbtaWidget.tsx` -- compact sizing
- `src/components/dashboard/widgets/SortableEventItem.tsx` -- darker info button

