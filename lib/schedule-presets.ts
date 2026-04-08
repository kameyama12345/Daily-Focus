import { SchedulePreset } from "@/lib/types";

export const RECOMMENDED_SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: "recommended-focus",
    type: "recommended",
    title: "集中重視",
    items: [
      { title: "ディープワーク", start: "09:00", end: "11:00", category: "Deep Work", priority: "High" },
      { title: "休憩", start: "11:00", end: "11:30", category: "Personal", priority: "Low", kind: "break" },
      { title: "重要タスク", start: "11:30", end: "13:00", category: "Deep Work", priority: "High" },
      { title: "事務作業", start: "14:00", end: "15:00", category: "Admin", priority: "Medium" },
    ],
  },
  {
    id: "recommended-balance",
    type: "recommended",
    title: "バランス型",
    items: [
      { title: "重要タスク", start: "09:30", end: "11:00", category: "Deep Work", priority: "High" },
      { title: "連絡・整理", start: "11:00", end: "11:30", category: "Admin", priority: "Medium" },
      { title: "集中タスク", start: "11:30", end: "12:30", category: "Deep Work", priority: "Medium" },
      { title: "休憩", start: "12:30", end: "13:00", category: "Personal", priority: "Low", kind: "break" },
      { title: "軽めの作業", start: "14:00", end: "15:00", category: "Admin", priority: "Low" },
    ],
  },
  {
    id: "recommended-light",
    type: "recommended",
    title: "軽めに進める",
    items: [
      { title: "準備・整理", start: "10:00", end: "10:30", category: "Admin", priority: "Low" },
      { title: "優先タスク（短め）", start: "10:30", end: "11:30", category: "Deep Work", priority: "Medium" },
      { title: "休憩", start: "11:30", end: "12:00", category: "Personal", priority: "Low", kind: "break" },
      { title: "フォローアップ", start: "14:00", end: "14:45", category: "Admin", priority: "Low" },
    ],
  },
];

export const TEMPLATE_SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: "template-weekday",
    type: "template",
    title: "平日テンプレート",
    items: [
      { title: "朝の整理", start: "09:00", end: "09:30", category: "Admin", priority: "Low" },
      { title: "ディープワーク", start: "09:30", end: "11:30", category: "Deep Work", priority: "High" },
      { title: "休憩", start: "11:30", end: "12:00", category: "Personal", priority: "Low", kind: "break" },
      { title: "打ち合わせ/調整", start: "13:00", end: "14:00", category: "Meeting", priority: "Medium" },
      { title: "事務・連絡", start: "15:00", end: "15:45", category: "Admin", priority: "Low" },
    ],
  },
  {
    id: "template-focus-day",
    type: "template",
    title: "集中日テンプレート",
    items: [
      { title: "ディープワーク（1）", start: "09:00", end: "11:30", category: "Deep Work", priority: "High" },
      { title: "休憩", start: "11:30", end: "12:00", category: "Personal", priority: "Low", kind: "break" },
      { title: "ディープワーク（2）", start: "13:00", end: "15:00", category: "Deep Work", priority: "High" },
      { title: "軽い整理", start: "15:15", end: "15:45", category: "Admin", priority: "Low" },
    ],
  },
  {
    id: "template-recovery-day",
    type: "template",
    title: "回復日テンプレート",
    items: [
      { title: "ゆっくり着手", start: "10:00", end: "10:30", category: "Personal", priority: "Low" },
      { title: "軽めの作業", start: "10:30", end: "11:30", category: "Admin", priority: "Low" },
      { title: "休憩", start: "11:30", end: "12:00", category: "Personal", priority: "Low", kind: "break" },
      { title: "振り返り・整理", start: "14:00", end: "14:45", category: "Personal", priority: "Low" },
    ],
  },
];

