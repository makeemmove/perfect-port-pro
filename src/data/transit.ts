/* ── Transit Data (from fall_river_guide_updated.csv) ── */

export interface TrainDeparture {
  dir: string;
  stops: Record<string, string>; // station name → time at that station
}

export interface TrainRoute {
  id: string;
  name: string;
  stations: string[];
  departures: TrainDeparture[];
}

export interface BusRoute {
  id: string;
  name: string;
  direction: string;
  cost: string;
  departures: string[];
}

/* ── Helpers ── */

export function t2m(s: string): number {
  if (!s) return 9999;
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 9999;
  let h = +m[1], mn = +m[2];
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + mn;
}

export function nowSec(): number {
  const n = new Date();
  return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
}

export function fmtCD(d: number): string | null {
  if (d < 0) return null;
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = d % 60;
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/* ── MBTA Commuter Rail (Fall River ↔ Boston) ── */

export const MBTA_STATIONS = ['Fall River Depot', 'Freetown', 'East Taunton'] as const;

export const MBTA_ROUTES: TrainRoute[] = [
  {
    id: 'weekday-inbound',
    name: 'Weekday Inbound (FR → Boston)',
    stations: [...MBTA_STATIONS],
    departures: [
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '5:10 AM', 'Freetown': '5:22 AM', 'East Taunton': '5:35 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '6:02 AM', 'Freetown': '6:14 AM', 'East Taunton': '6:27 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '6:37 AM', 'Freetown': '6:49 AM', 'East Taunton': '7:02 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '7:10 AM', 'Freetown': '7:22 AM', 'East Taunton': '7:35 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '7:43 AM', 'Freetown': '7:55 AM', 'East Taunton': '8:08 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '8:30 AM', 'Freetown': '8:42 AM', 'East Taunton': '8:55 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '9:30 AM', 'Freetown': '9:42 AM', 'East Taunton': '9:55 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '11:30 AM', 'Freetown': '11:42 AM', 'East Taunton': '11:55 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '1:30 PM', 'Freetown': '1:42 PM', 'East Taunton': '1:55 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '3:30 PM', 'Freetown': '3:42 PM', 'East Taunton': '3:55 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '5:10 PM', 'Freetown': '5:22 PM', 'East Taunton': '5:35 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '6:30 PM', 'Freetown': '6:42 PM', 'East Taunton': '6:55 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '8:10 PM', 'Freetown': '8:22 PM', 'East Taunton': '8:35 PM' } },
    ],
  },
  {
    id: 'weekday-outbound',
    name: 'Weekday Outbound (Boston → FR)',
    stations: [...MBTA_STATIONS],
    departures: [
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '7:45 AM', 'Freetown': '7:58 AM', 'Fall River Depot': '8:10 AM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '8:45 AM', 'Freetown': '8:58 AM', 'Fall River Depot': '9:10 AM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '10:15 AM', 'Freetown': '10:28 AM', 'Fall River Depot': '10:40 AM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '12:15 PM', 'Freetown': '12:28 PM', 'Fall River Depot': '12:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '2:15 PM', 'Freetown': '2:28 PM', 'Fall River Depot': '2:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '4:15 PM', 'Freetown': '4:28 PM', 'Fall River Depot': '4:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '5:15 PM', 'Freetown': '5:28 PM', 'Fall River Depot': '5:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '6:15 PM', 'Freetown': '6:28 PM', 'Fall River Depot': '6:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '6:45 PM', 'Freetown': '6:58 PM', 'Fall River Depot': '7:10 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '7:45 PM', 'Freetown': '7:58 PM', 'Fall River Depot': '8:10 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '8:45 PM', 'Freetown': '8:58 PM', 'Fall River Depot': '9:10 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '10:45 PM', 'Freetown': '10:58 PM', 'Fall River Depot': '11:10 PM' } },
    ],
  },
  {
    id: 'weekend-inbound',
    name: 'Weekend Inbound (FR → Boston)',
    stations: [...MBTA_STATIONS],
    departures: [
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '7:00 AM', 'Freetown': '7:12 AM', 'East Taunton': '7:25 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '9:00 AM', 'Freetown': '9:12 AM', 'East Taunton': '9:25 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '11:00 AM', 'Freetown': '11:12 AM', 'East Taunton': '11:25 AM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '1:00 PM', 'Freetown': '1:12 PM', 'East Taunton': '1:25 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '3:00 PM', 'Freetown': '3:12 PM', 'East Taunton': '3:25 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '5:00 PM', 'Freetown': '5:12 PM', 'East Taunton': '5:25 PM' } },
      { dir: 'Inbound → South Station', stops: { 'Fall River Depot': '7:00 PM', 'Freetown': '7:12 PM', 'East Taunton': '7:25 PM' } },
    ],
  },
  {
    id: 'weekend-outbound',
    name: 'Weekend Outbound (Boston → FR)',
    stations: [...MBTA_STATIONS],
    departures: [
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '9:15 AM', 'Freetown': '9:28 AM', 'Fall River Depot': '9:40 AM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '11:15 AM', 'Freetown': '11:28 AM', 'Fall River Depot': '11:40 AM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '1:15 PM', 'Freetown': '1:28 PM', 'Fall River Depot': '1:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '3:15 PM', 'Freetown': '3:28 PM', 'Fall River Depot': '3:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '5:15 PM', 'Freetown': '5:28 PM', 'Fall River Depot': '5:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '7:15 PM', 'Freetown': '7:28 PM', 'Fall River Depot': '7:40 PM' } },
      { dir: 'Outbound → Fall River', stops: { 'East Taunton': '9:15 PM', 'Freetown': '9:28 PM', 'Fall River Depot': '9:40 PM' } },
    ],
  },
];

/* ── SRTA Bus Routes ── */

export const SRTA_ROUTES: BusRoute[] = [
  {
    id: 'route-101',
    name: 'Route 101 – South Main',
    direction: 'SRTA Terminal → South Main',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:10 AM','6:40 AM','7:10 AM','7:40 AM','8:10 AM','8:40 AM','9:10 AM','9:40 AM',
      '10:10 AM','10:40 AM','11:10 AM','11:40 AM','12:10 PM','12:40 PM','1:10 PM','1:40 PM',
      '2:10 PM','2:40 PM','3:10 PM','3:40 PM','4:10 PM','4:40 PM','5:10 PM','5:40 PM',
      '6:10 PM','6:40 PM','7:10 PM','7:40 PM','8:10 PM','8:40 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-102',
    name: 'Route 102 – North Main',
    direction: 'SRTA Terminal → Four Winds',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
      '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-103',
    name: 'Route 103 – Laurel St',
    direction: 'SRTA Terminal → Ocean State Job Lot',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:30 AM','7:30 AM','8:30 AM','9:30 AM','10:30 AM','11:30 AM',
      '12:30 PM','1:30 PM','2:30 PM','3:30 PM','4:30 PM','5:30 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-104',
    name: 'Route 104 – Robeson St',
    direction: 'SRTA Terminal → Catholic Memorial Home',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:10 AM','7:10 AM','8:10 AM','9:10 AM','10:10 AM','11:10 AM',
      '12:10 PM','1:10 PM','2:10 PM','3:10 PM','4:10 PM','5:10 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-105',
    name: 'Route 105 – Stafford Rd',
    direction: 'SRTA Terminal → Southcoast Marketplace',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:20 AM','7:20 AM','8:20 AM','9:20 AM','10:20 AM','11:20 AM',
      '12:20 PM','1:20 PM','2:20 PM','3:20 PM','4:20 PM','5:20 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-106',
    name: 'Route 106 – Pleasant St',
    direction: 'SRTA Terminal → Pleasant St / Flint / Eastern Ave',
    cost: '$1.50',
    departures: [
      '6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM',
      '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
      '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM',
      '6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-107',
    name: 'Route 107 – Bay St',
    direction: 'SRTA Terminal → Bay St Turnaround',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:30 AM','7:30 AM','8:30 AM','9:30 AM','10:30 AM','11:30 AM',
      '12:30 PM','1:30 PM','2:30 PM','3:30 PM','4:30 PM','5:30 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-108',
    name: 'Route 108 – BCC',
    direction: 'SRTA Terminal → Bristol Community College',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:35 AM','7:35 AM','8:35 AM','9:35 AM','10:35 AM','11:35 AM',
      '12:35 PM','1:35 PM','2:35 PM','3:35 PM','4:35 PM','5:35 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-109',
    name: 'Route 109 – Bedford St',
    direction: 'SRTA Terminal → County St & Pleasant St',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:20 AM','7:20 AM','8:20 AM','9:20 AM','10:20 AM','11:20 AM',
      '12:20 PM','1:20 PM','2:20 PM','3:20 PM','4:20 PM','5:20 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-110',
    name: 'Route 110 – Rodman St',
    direction: 'SRTA Terminal → Fall River Walmart',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:30 AM','7:30 AM','8:30 AM','9:30 AM','10:30 AM','11:30 AM',
      '12:30 PM','1:30 PM','2:30 PM','3:30 PM','4:30 PM','5:30 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-114',
    name: 'Route 114 – Swansea',
    direction: 'SRTA Terminal → Swansea Walmart',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '8:30 AM','10:30 AM','12:30 PM','2:30 PM','4:30 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-9-to-fr',
    name: 'Route 9 – Intercity (→ Fall River)',
    direction: 'New Bedford → Fall River',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '6:00 AM','7:00 AM','8:00 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM',
      '11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM',
      '3:30 PM','4:00 PM','4:30 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-9-to-nb',
    name: 'Route 9 – Intercity (→ New Bedford)',
    direction: 'Fall River → New Bedford',
    cost: '$1.50 / $1.25 CharlieCard',
    departures: [
      '7:05 AM','8:05 AM','9:05 AM','10:05 AM','10:35 AM','11:05 AM','11:35 AM','12:05 PM',
      '12:35 PM','1:05 PM','1:35 PM','2:05 PM','2:35 PM','3:05 PM','3:35 PM','4:05 PM',
      '5:05 PM','6:05 PM','7:05 PM','8:05 PM',
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
];

/* Backward compat */
export const TRAIN_DEPS = MBTA_ROUTES[0].departures;
export const BUS_DEPS = SRTA_ROUTES[0].departures;
