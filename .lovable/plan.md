

## Swap Data Source to fall_river_dashboard_master.csv

### Overview
Replace the hardcoded data in `events.ts` and `transit.ts` with the expanded dataset from the new master CSV. The new CSV adds more MBTA stations (10 total), more train departures, and many more recurring events. Restaurant data is unchanged. No UI/styling changes needed.

### 1. Copy CSV into project
- Copy `user-uploads://fall_river_dashboard_master.csv` to `src/data/fall_river_dashboard_master.csv` to replace the old CSV reference

### 2. Update `src/data/transit.ts` -- Expanded MBTA stations and schedules

**Stations**: Expand `MBTA_STATIONS` from 3 to 10 stops:
`['Fall River Depot', 'Freetown', 'East Taunton', 'Bridgewater', 'Brockton', 'Campello', 'Holbrook/Randolph', 'Braintree', 'Quincy Center', 'JFK/UMass', 'South Station']`

Note: Campello only appears on outbound routes, so station list order follows the inbound direction (FR to Boston). The `stops` record for each departure will only include stations that train actually serves.

**Weekday Inbound**: 13 trains (5:10 AM through 8:10 PM) -- same as current, but each departure now has all 10 station stops parsed from the CSV Location column.

**Weekday Outbound**: Expand from 12 to 13 trains. Add the 11:30 PM last train. Each departure gets all station stops (South Station through Fall River Depot, including Campello).

**Weekend Inbound**: 7 trains (same count), add full station stops.

**Weekend Outbound**: 7 trains (same count), add full station stops.

The MBTA widget station selector will automatically show all 10 stations since it reads from `trainRoute.stations`. The countdown logic in HomeTab already filters by `selectedStation` using the `stops` record, so it will work with the expanded station list without any code changes.

### 3. Update `src/data/events.ts` -- Add new events from CSV

Add all new events from the master CSV that are not in the current dataset. Key additions:
- Recurring monthly Teen Game Night (May through December)
- Recurring monthly Writing Group (May through December)  
- Recurring monthly YA Comics Club, Books & Tea Club, Photography Group
- New Battleship Cove events (Citizenship in the World, Junior Detective, Junior Create & Innovate, Homeschool Days in May)
- Banned Book Club (December)
- Additional community events (AARP Tax Prep, Native American Storytelling, SketchyGOichie, Kid's Art Workshop)
- Arts & Culture: Watercolor Workshop as separate monthly entry

Each event includes `url` and `location` fields from the CSV's Source URL and Location columns for the More Info modal.

### 4. Verify More Info links
The QuickViewModal already reads the `url` prop and renders a "Visit Website" button. All events and restaurants already have `url` fields populated. The new events will also include `url` from the CSV. No code changes needed for this -- just ensuring every new event entry has its `url` field set.

### 5. No changes needed
- `src/data/restaurants.ts` -- identical data, no changes
- All UI components (HomeTab, EventsTab, EatsTab, MbtaWidget, etc.) -- no changes
- No styling or camera/perspective changes

### Files changed

| File | Action |
|------|--------|
| `src/data/fall_river_dashboard_master.csv` | New -- copy of uploaded CSV |
| `src/data/transit.ts` | Update MBTA_STATIONS (3 to 10), expand all departure stops records, add 11:30 PM outbound train |
| `src/data/events.ts` | Add ~30 new recurring/one-time events from CSV with url and location fields |

