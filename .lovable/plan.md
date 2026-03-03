

## Plan: Heavy Floating Shadows + Fork Icon in Bottom Nav

### 1. Heavy floating shadow on all white cards

**File: `tailwind.config.ts`** (line 79)

Update `shadow-card` to a much heavier, downward-only shadow to create a dramatic "floating" effect:

```
card: "0 16px 48px -8px rgba(0,0,0,0.18), 0 8px 20px -4px rgba(0,0,0,0.10)"
```

This doubles the vertical offset and spread, making cards look physically lifted off the surface.

### 2. Replace Eats bottom tab icon with fork

**File: `src/components/dashboard/BottomNav.tsx`** (lines 22-29)

Replace the current plate/steam icon with the same fork SVG used in StatsWidget:

```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={1.6}>
  <path d="M11 2v6.5c0 1.38-1.12 2.5-2.5 2.5S6 9.88 6 8.5V2" />
  <path d="M8.5 2v6.5" />
  <path d="M8.5 11v11" />
</svg>
```

### Summary

| Change | File | Detail |
|--------|------|--------|
| Heavy floating shadow | `tailwind.config.ts` | Increase `shadow-card` offset/spread for dramatic lift |
| Fork icon in bottom nav | `BottomNav.tsx` | Replace plate icon with fork SVG |

