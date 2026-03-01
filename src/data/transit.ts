export interface TrainDeparture {
  time: string;
  dir: string;
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

export const TRAIN_DEPS: TrainDeparture[] = [
  {time:"6:10 AM",dir:"Inbound → South Station"},{time:"7:10 AM",dir:"Inbound → South Station"},
  {time:"8:10 AM",dir:"Inbound → South Station"},{time:"9:05 AM",dir:"Inbound → South Station"},
  {time:"12:10 PM",dir:"Inbound → South Station"},{time:"3:10 PM",dir:"Inbound → South Station"},
  {time:"8:00 AM",dir:"Outbound → Fall River"},{time:"3:00 PM",dir:"Outbound → Fall River"},
  {time:"4:00 PM",dir:"Outbound → Fall River"},{time:"5:00 PM",dir:"Outbound → Fall River"},
  {time:"5:30 PM",dir:"Outbound → Fall River"},{time:"6:30 PM",dir:"Outbound → Fall River"},
  {time:"7:30 PM",dir:"Outbound → Fall River"},{time:"9:30 PM",dir:"Outbound → Fall River"},
  {time:"11:30 PM",dir:"Outbound → Fall River"},
].sort((a, b) => t2m(a.time) - t2m(b.time));

export const BUS_DEPS: string[] = [
  "6:10 AM","6:40 AM","7:10 AM","7:40 AM","8:10 AM","8:40 AM","9:10 AM","9:40 AM",
  "10:10 AM","10:40 AM","11:10 AM","11:40 AM","12:10 PM","12:40 PM","1:10 PM","1:40 PM",
  "2:10 PM","2:40 PM","3:10 PM","3:40 PM","4:10 PM","4:40 PM","5:10 PM","5:40 PM",
  "6:10 PM","6:40 PM","7:10 PM","7:40 PM","8:10 PM","8:40 PM"
].sort((a, b) => t2m(a) - t2m(b));
