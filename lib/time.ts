import { HOUR_HEIGHT, MINUTES_IN_DAY, SNAP_MINUTES, START_HOUR } from "@/lib/constants";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function snapMinute(minute: number) {
  return clamp(Math.round(minute / SNAP_MINUTES) * SNAP_MINUTES, 0, MINUTES_IN_DAY);
}

export function formatMinute(minute: number) {
  const hours = Math.floor(minute / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minute % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

export function minuteToOffset(minute: number) {
  return ((minute - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

export function offsetToMinute(offset: number) {
  return START_HOUR * 60 + (offset / HOUR_HEIGHT) * 60;
}

export function formatDuration(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}
