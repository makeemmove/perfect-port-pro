

# Plan: Update Theme to Match Logo & Tighten Spacing

## 1. Theme Color Updates

The logo features these dominant colors:
- **Dark navy blue** (bridge, text) — already close to current `--primary: 222 47% 11%`
- **Warm amber/orange sunset** — the sky gradient behind the bridge
- **Golden yellow** — sun/highlights
- **Steel gray-blue** — battleship and water

Changes to `src/index.css`:
- Update `--background` to a warmer off-white with slight amber undertone (e.g., `35 25% 96%`)
- Update `--accent` and `--secondary` from purple (`245 58% 51%`) to a warm amber-orange (`25 90% 50%`) to match the sunset tones in the logo
- Update `--muted` to a warmer gray
- Update `--gold` to match the logo's golden highlights
- Update `--border` and `--input` to warmer gray tones

Files: `src/index.css`, `tailwind.config.ts` (if needed for new color tokens)

## 2. Tighten Spacing Between Logo and Content

Changes to `src/components/dashboard/HomeTab.tsx`:
- Increase negative bottom margin on the logo container (e.g., `-mb-10` or more) to pull news section up closer to the logo bottom
- Reduce the logo image height from `h-64` to something like `h-48` to leave less whitespace
- Ensure consistent `space-y-4` between widget cards

## Files to Edit
1. `src/index.css` — update CSS custom properties for warmer, logo-matching palette
2. `src/components/dashboard/HomeTab.tsx` — tighten logo-to-content spacing

