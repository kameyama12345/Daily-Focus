import { Category, Priority } from "@/lib/types";

export const START_HOUR = 6;
export const END_HOUR = 23;
export const HOUR_HEIGHT = 88;
export const MINUTES_IN_DAY = 24 * 60;
export const VISIBLE_MINUTES = (END_HOUR - START_HOUR) * 60;
export const SNAP_MINUTES = 15;
export const FOCUS_SECONDS = 25 * 60;
export const BREAK_SECONDS = 5 * 60;

export const CATEGORY_STYLES: Record<
  Category,
  { color: string; soft: string; chip: string }
> = {
  "Deep Work": {
    color: "bg-blue-600",
    soft: "bg-blue-50 text-blue-700",
    chip: "border-blue-200/80 bg-blue-100/70 text-blue-700",
  },
  Meeting: {
    color: "bg-slate-700",
    soft: "bg-slate-100 text-slate-700",
    chip: "border-slate-200/80 bg-slate-100 text-slate-700",
  },
  Admin: {
    color: "bg-amber-500",
    soft: "bg-amber-50 text-amber-700",
    chip: "border-amber-200/80 bg-amber-100/70 text-amber-700",
  },
  Personal: {
    color: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-700",
    chip: "border-emerald-200/80 bg-emerald-100/70 text-emerald-700",
  },
};

export const CATEGORY_OPTIONS: Category[] = [
  "Deep Work",
  "Meeting",
  "Admin",
  "Personal",
];

export const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High"];
