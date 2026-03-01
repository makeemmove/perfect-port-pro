

## Add "More Info" Quick View Modal for Events and Restaurants

### Overview
Add a "More Info" button to every event card and restaurant card across the app. Tapping it opens a styled modal showing the full description, location, cost, and a "Visit Website" link. The modal uses backdrop blur to match the dashboard aesthetic and does not affect layout or camera angle.

### Data Changes

**`src/data/events.ts`**
- Add `url?: string` field to the `CityEvent` interface
- Populate `url` and `location` for every event entry using the CSV's `Source URL` and `Location` columns (many events are already missing `location` -- fill those in from the CSV)

**`src/data/restaurants.ts`**
- Add `url?: string` field to the `Restaurant` interface
- Populate `url` for every restaurant entry from the CSV's `Source URL` column

### New Component: QuickViewModal

**`src/components/dashboard/QuickViewModal.tsx`**

A reusable modal built on the existing Radix Dialog (`src/components/ui/dialog.tsx`):
- Props: `open`, `onOpenChange`, `title`, `description`, `location`, `cost`, `url`, `category` (optional tag label)
- Layout: DialogOverlay with `backdrop-blur-sm` + semi-transparent black background
- Content:
  - Title (bold, prominent)
  - Category tag (styled pill matching existing tag styles)
  - Full description text (no truncation)
  - Location line with a pin icon
  - Cost/price line
  - "Visit Website" button (opens `url` in new tab via `window.open`)
  - Built-in X close button from Dialog component
- Styling: Uses existing `bg-card`, `border-border`, `rounded-xl`, `shadow-lg` classes to match dashboard aesthetic

### UI Changes

**`src/components/dashboard/EventsTab.tsx`**
- Add state: `selectedEvent: CityEvent | null`
- Add a "More Info" button to each event card (small, secondary-style button in the bottom-right area of each card)
- Clicking it sets `selectedEvent` and opens the QuickViewModal
- Pass event's `desc`, `location`, `cost`, `url`, and category tag to the modal

**`src/components/dashboard/widgets/ComingUpWidget.tsx`**
- Add a small "More Info" button or make the event row clickable
- On click, opens the same QuickViewModal with that event's details
- Requires lifting modal state up or accepting an `onEventClick` callback prop

**`src/components/dashboard/HomeTab.tsx`**
- Add `selectedEvent` state and pass an `onEventClick` handler to ComingUpWidget
- Render one shared QuickViewModal instance at the HomeTab level for coming-up events

**`src/components/dashboard/EatsTab.tsx`**
- Add state: `selectedRestaurant: Restaurant | null`
- Add a "More Info" button to each restaurant card (alongside the existing click-to-fly-to-map behavior)
- Clicking "More Info" opens QuickViewModal with restaurant's `desc`, `loc`, `price`, `url`, and category

### Overlay Styling
- Modify `DialogOverlay` usage (or pass className) to add `backdrop-blur-sm` for the frosted glass effect
- The modal content container uses existing card styling with `max-w-md` for mobile-friendly sizing
- No changes to any 3D perspective, transforms, or camera angles

### Technical Details

| File | Action |
|------|--------|
| `src/data/events.ts` | Add `url` field to interface; populate `url` and `location` from CSV |
| `src/data/restaurants.ts` | Add `url` field to interface; populate `url` from CSV |
| `src/components/dashboard/QuickViewModal.tsx` | New -- reusable modal component |
| `src/components/dashboard/EventsTab.tsx` | Add "More Info" button + modal state |
| `src/components/dashboard/EatsTab.tsx` | Add "More Info" button + modal state |
| `src/components/dashboard/widgets/ComingUpWidget.tsx` | Add click handler for event details |
| `src/components/dashboard/HomeTab.tsx` | Add shared modal state for ComingUpWidget events |

No new dependencies needed -- uses the existing Radix Dialog already installed.

