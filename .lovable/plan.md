

## Add Route Selector for SRTA Bus and MBTA Train Cards

### What changes
Both the MBTA Commuter Rail card and the SRTA Bus card on the Home tab will become interactive. Tapping the countdown timer or card header will expand a dropdown/selector letting you pick from multiple routes. The selected route's schedule will then drive the live countdown, departure time, and "next after" info on the main page.

### New data: Multiple routes in `src/data/transit.ts`

Currently there is one set of train departures and one set of bus times. We will restructure the data to support multiple routes:

- **SRTA Bus Routes** -- Add 4-5 realistic Fall River SRTA routes (e.g., Route 101 South Main, Route 102 North Main, Route 103 Plymouth Ave, Route 104 Eastern Ave), each with its own departure time array and direction label.
- **MBTA Train Lines** -- Add 2-3 options (e.g., Fall River Line, New Bedford Line, Middleborough Line), each with its own `TrainDeparture[]` array.

Data shape:
```text
BusRoute { id, name, direction, departures: string[] }
TrainRoute { id, name, departures: TrainDeparture[] }

SRTA_ROUTES: BusRoute[]
MBTA_ROUTES: TrainRoute[]
```

### UI changes in `src/components/dashboard/HomeTab.tsx`

1. **State** -- Add `selectedBusRoute` and `selectedTrainRoute` state (default to first route).

2. **MBTA Card** -- Add a subtle dropdown (using the existing Radix Select component) inside the card header area. When tapped, it shows all available MBTA lines. Selecting one swaps the departure data the `tick()` function uses. The countdown, depart time, direction, and "next after" all update live.

3. **SRTA Card** -- Same pattern: a Select dropdown in the card header lets users pick a bus route. The card label, countdown, and departure info update accordingly.

4. **Tick function** -- Refactor `tick()` to read from the currently selected route objects instead of the hardcoded `TRAIN_DEPS` / `BUS_DEPS` arrays.

5. **Full schedule popover** -- When the user taps the countdown timer itself, a popover (using existing Radix Popover) slides open showing all remaining departures for that route today in a scrollable list, so users can see the full schedule at a glance.

### Technical details

**Files modified:**
- `src/data/transit.ts` -- Restructure exports to `MBTA_ROUTES` and `SRTA_ROUTES` arrays; keep `TRAIN_DEPS` and `BUS_DEPS` as the first route's data for backward compatibility.
- `src/components/dashboard/HomeTab.tsx` -- Add route selection state, replace hardcoded references, add Select dropdowns and Popover for full schedule.

**Components used (already installed):**
- `@radix-ui/react-select` via `src/components/ui/select.tsx`
- `@radix-ui/react-popover` via `src/components/ui/popover.tsx`

**No new dependencies needed.**

### Visual design
- The route selector will appear as a compact pill-style Select inside each transit card header, matching the existing uppercase tracking-widest label style.
- The full schedule popover will show a clean scrollable list with times and directions, using the same card/border styling already in the app.
- Active/selected route gets a subtle primary highlight.

