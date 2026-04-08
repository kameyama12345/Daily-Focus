"use client";

import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatDuration, formatMinute } from "@/lib/time";
import { ThemeMode, ThemeToggle } from "@/components/theme-toggle";
import { DashboardStats, PomodoroStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SummaryPanel({
  dashboard,
  theme,
  onToggleTheme,
  viewMode,
  onViewModeChange,
  focusSuggestion,
  isFocusMode,
  focusState,
  weekDates,
  selectedDate,
  onDateChange,
}: {
  dashboard: DashboardStats;
  theme: ThemeMode;
  onToggleTheme: () => void;
  viewMode: "day" | "week";
  onViewModeChange: (mode: "day" | "week") => void;
  focusSuggestion: { startMinute: number; endMinute: number };
  isFocusMode: boolean;
  focusState: PomodoroStatus;
  weekDates: string[];
  selectedDate: string;
  onDateChange: (dateKey: string) => void;
}) {
  const today = new Date();
  const parseDateKey = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const weekStrip = weekDates.map((dateKey) => {
    const date = parseDateKey(dateKey);
    const isSelected = dateKey === selectedDate;
    const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    return {
      dateKey,
      label: format(date, "E", { locale: ja }),
      day: format(date, "d"),
      isToday,
      isSelected,
    };
  });

  const selectedDateObj = parseDateKey(selectedDate);

  return (
    <aside
      className="soft-scrollbar h-full overflow-y-auto pr-1 transition duration-300"
      style={{
        opacity: isFocusMode ? (focusState === "running" ? 0.22 : focusState === "paused" ? 0.34 : 0.42) : 1,
        filter: isFocusMode ? "saturate(0.68) blur(0.6px)" : "none",
      }}
    >
      <div className="space-y-4 pb-4">
        <section className="surface rounded-[24px] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Daily Focus</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {format(selectedDateObj, "M月d日", { locale: ja })}
              </h1>
              <p className="mt-1 text-sm text-muted">今日の予定を整える</p>
            </div>
            <ThemeToggle onToggle={onToggleTheme} theme={theme} />
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">State</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold tracking-tight">
                  {formatDuration(dashboard.focusMinutes)}
                </div>
                <div className="mt-1 text-sm text-muted">今日の集中時間</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{dashboard.pomodoroCount}</div>
                <div className="mt-1 text-xs text-muted">Pomodoro</div>
              </div>
            </div>

            <div className="rounded-[20px] px-4 py-4" style={{ background: "var(--bg-muted)" }}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="完了" value={`${dashboard.completedTasks}`} />
                <Metric label="進行中" value={`${dashboard.activeTasks}`} />
                <Metric label="空き時間" value={formatDuration(dashboard.freeMinutes)} />
                <Metric label="Focus slot" value={formatMinute(focusSuggestion.startMinute)} />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Week</div>
                <div className="rounded-full p-1" style={{ background: "var(--bg-muted)" }}>
                  {(["day", "week"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs transition",
                        viewMode === mode ? "" : "text-muted",
                      )}
                      onClick={() => onViewModeChange(mode)}
                      style={
                        viewMode === mode
                          ? {
                              background: "var(--button-primary)",
                              color: "var(--button-primary-text)",
                            }
                          : undefined
                      }
                      type="button"
                    >
                      {mode === "day" ? "Day" : "Week"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {weekStrip.map((item) => (
                  <button
                    key={item.dateKey}
                    className={cn(
                      "rounded-[18px] px-2 py-3 text-center transition",
                      isFocusMode && "cursor-not-allowed",
                    )}
                    disabled={isFocusMode}
                    onClick={() => onDateChange(item.dateKey)}
                    style={{
                      background: item.isSelected ? "var(--accent-soft)" : "transparent",
                      border: item.isSelected ? "1px solid var(--line-strong)" : "1px solid transparent",
                      opacity: isFocusMode ? 0.65 : 1,
                    }}
                    type="button"
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{item.label}</div>
                    <div
                      className={cn(
                        "mt-2 text-base font-semibold",
                        item.isToday && !item.isSelected && "opacity-90",
                      )}
                    >
                      {item.day}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="surface rounded-[24px] p-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--accent)" }}>
            <Sparkles className="h-4 w-4" />
            おすすめ集中時間
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight">
            {formatMinute(focusSuggestion.startMinute)} - {formatMinute(focusSuggestion.endMinute)}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            空き時間の中で、最も自然に深い作業を置ける1時間です。
          </p>
        </section>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
