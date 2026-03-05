

## Plan: Clickable Map Pins, Bigger Logo, Slower Jiggle, Drag Vibration

### 1. Clickable Map Pin on Eats Tab (`src/components/dashboard/EatsTab.tsx`)
- Make the `📍` location text a clickable link that opens Google Maps with the restaurant address
- Wrap the pin + address in an `<a>` tag with `href="https://www.google.com/maps/search/?api=1&query={encoded address}"` and `target="_blank"`
- Style it with an underline on hover and a subtle color change to indicate it's tappable

### 2. Bigger Logo (`src/components/dashboard/HomeTab.tsx`)
- Change logo from `h-48` to `h-56` or `h-64` on line 261

### 3. Slower Jiggle Animation (`src/index.css`)
- Change jiggle animation duration from `0.3s` to `1.2s` (line 134) for a slower, more gentle wobble
- Reduce rotation from `±1deg` to `±0.8deg` for subtlety

### 4. Continuous Vibration During Drag (`src/components/dashboard/HomeTab.tsx`)
- Already vibrates on drag start (line 183) and on swap (line 190)
- Increase vibration duration from `10ms` to `30-50ms` on drag start and swap so it's more noticeable
- The swap vibration at line 190 confirms movement — make it stronger (e.g., `50ms`)

### Files to Edit
1. `src/components/dashboard/EatsTab.tsx` — clickable map pin links
2. `src/components/dashboard/HomeTab.tsx` — bigger logo
3. `src/index.css` — slower jiggle animation
4. `src/components/dashboard/HomeTab.tsx` — stronger vibration feedback

