export interface TrainDeparture {
  time: string;
  dir: string;
}

export interface TrainRoute {
  id: string;
  name: string;
  departures: TrainDeparture[];
}

export interface BusRoute {
  id: string;
  name: string;
  direction: string;
  departures: string[];
}

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

/* ── MBTA Commuter Rail Routes ── */

export const MBTA_ROUTES: TrainRoute[] = [
  {
    id: 'fall-river',
    name: 'Fall River Line',
    departures: [
      { time: "6:10 AM", dir: "Inbound → South Station" },
      { time: "7:10 AM", dir: "Inbound → South Station" },
      { time: "8:00 AM", dir: "Outbound → Fall River" },
      { time: "8:10 AM", dir: "Inbound → South Station" },
      { time: "9:05 AM", dir: "Inbound → South Station" },
      { time: "12:10 PM", dir: "Inbound → South Station" },
      { time: "3:00 PM", dir: "Outbound → Fall River" },
      { time: "3:10 PM", dir: "Inbound → South Station" },
      { time: "4:00 PM", dir: "Outbound → Fall River" },
      { time: "5:00 PM", dir: "Outbound → Fall River" },
      { time: "5:30 PM", dir: "Outbound → Fall River" },
      { time: "6:30 PM", dir: "Outbound → Fall River" },
      { time: "7:30 PM", dir: "Outbound → Fall River" },
      { time: "9:30 PM", dir: "Outbound → Fall River" },
      { time: "11:30 PM", dir: "Outbound → Fall River" },
    ].sort((a, b) => t2m(a.time) - t2m(b.time)),
  },
  {
    id: 'new-bedford',
    name: 'New Bedford Line',
    departures: [
      { time: "5:55 AM", dir: "Inbound → South Station" },
      { time: "6:55 AM", dir: "Inbound → South Station" },
      { time: "7:55 AM", dir: "Inbound → South Station" },
      { time: "8:50 AM", dir: "Inbound → South Station" },
      { time: "11:55 AM", dir: "Inbound → South Station" },
      { time: "2:55 PM", dir: "Inbound → South Station" },
      { time: "7:45 AM", dir: "Outbound → New Bedford" },
      { time: "2:45 PM", dir: "Outbound → New Bedford" },
      { time: "3:45 PM", dir: "Outbound → New Bedford" },
      { time: "4:45 PM", dir: "Outbound → New Bedford" },
      { time: "5:15 PM", dir: "Outbound → New Bedford" },
      { time: "6:15 PM", dir: "Outbound → New Bedford" },
      { time: "7:15 PM", dir: "Outbound → New Bedford" },
      { time: "9:15 PM", dir: "Outbound → New Bedford" },
      { time: "11:15 PM", dir: "Outbound → New Bedford" },
    ].sort((a, b) => t2m(a.time) - t2m(b.time)),
  },
  {
    id: 'middleborough',
    name: 'Middleborough Line',
    departures: [
      { time: "6:30 AM", dir: "Inbound → South Station" },
      { time: "7:25 AM", dir: "Inbound → South Station" },
      { time: "8:25 AM", dir: "Inbound → South Station" },
      { time: "9:30 AM", dir: "Inbound → South Station" },
      { time: "12:30 PM", dir: "Inbound → South Station" },
      { time: "3:30 PM", dir: "Inbound → South Station" },
      { time: "4:15 PM", dir: "Outbound → Middleborough" },
      { time: "5:15 PM", dir: "Outbound → Middleborough" },
      { time: "5:50 PM", dir: "Outbound → Middleborough" },
      { time: "6:50 PM", dir: "Outbound → Middleborough" },
      { time: "8:00 PM", dir: "Outbound → Middleborough" },
      { time: "10:00 PM", dir: "Outbound → Middleborough" },
    ].sort((a, b) => t2m(a.time) - t2m(b.time)),
  },
];

/* ── SRTA Bus Routes ── */

export const SRTA_ROUTES: BusRoute[] = [
  {
    id: 'route-101',
    name: 'Route 101 – South Main',
    direction: 'Outbound',
    departures: [
      "6:10 AM","6:40 AM","7:10 AM","7:40 AM","8:10 AM","8:40 AM","9:10 AM","9:40 AM",
      "10:10 AM","10:40 AM","11:10 AM","11:40 AM","12:10 PM","12:40 PM","1:10 PM","1:40 PM",
      "2:10 PM","2:40 PM","3:10 PM","3:40 PM","4:10 PM","4:40 PM","5:10 PM","5:40 PM",
      "6:10 PM","6:40 PM","7:10 PM","7:40 PM","8:10 PM","8:40 PM"
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-102',
    name: 'Route 102 – North Main',
    direction: 'Northbound',
    departures: [
      "6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM",
      "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM",
      "2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
      "6:00 PM","6:30 PM","7:00 PM","7:30 PM"
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-103',
    name: 'Route 103 – Plymouth Ave',
    direction: 'Eastbound',
    departures: [
      "6:15 AM","7:00 AM","7:45 AM","8:30 AM","9:15 AM","10:00 AM","10:45 AM","11:30 AM",
      "12:15 PM","1:00 PM","1:45 PM","2:30 PM","3:15 PM","4:00 PM","4:45 PM","5:30 PM",
      "6:15 PM","7:00 PM","7:45 PM"
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-104',
    name: 'Route 104 – Eastern Ave',
    direction: 'Eastbound',
    departures: [
      "6:20 AM","7:10 AM","8:00 AM","8:50 AM","9:40 AM","10:30 AM","11:20 AM",
      "12:10 PM","1:00 PM","1:50 PM","2:40 PM","3:30 PM","4:20 PM","5:10 PM",
      "6:00 PM","6:50 PM","7:40 PM","8:30 PM"
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
  {
    id: 'route-105',
    name: 'Route 105 – Globe St',
    direction: 'Westbound',
    departures: [
      "6:30 AM","7:15 AM","8:00 AM","8:45 AM","9:30 AM","10:15 AM","11:00 AM","11:45 AM",
      "12:30 PM","1:15 PM","2:00 PM","2:45 PM","3:30 PM","4:15 PM","5:00 PM","5:45 PM",
      "6:30 PM","7:15 PM"
    ].sort((a, b) => t2m(a) - t2m(b)),
  },
];

/* Backward compat */
export const TRAIN_DEPS = MBTA_ROUTES[0].departures;
export const BUS_DEPS = SRTA_ROUTES[0].departures;
