"use client";

import { CalendarDays, CheckCheck, Clock3, Coffee, Download, TimerReset, Undo2, Upload } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatDuration, formatMinute, formatSeconds } from "@/lib/time";
import { DashboardStats, PomodoroState, PomodoroStatus, Task, WorkLog } from "@/lib/types";

export function RightRail({
  tasks,
  logs,
  pomodoro,
  dashboard,
  selectedTask,
  onEditTask,
  onToggleTaskCompletion,
  onRemoveTask,
  onPomodoroTaskChange,
  pomodoroPreferences,
  onPomodoroPreferencesChange,
  canUndo,
  onUndo,
  onExport,
  onImport,
  onStartPause,
  onReset,
  focusState,
  isFocusMode,
}: {
  tasks: Task[];
  logs: WorkLog[];
  pomodoro: PomodoroState;
  dashboard: DashboardStats;
  selectedTask: Task | null;
  onEditTask: (task: Task) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onPomodoroTaskChange: (taskId: string | null) => void;
  pomodoroPreferences: {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    autoStartBreak: boolean;
    autoStartFocus: boolean;
  };
  onPomodoroPreferencesChange: (next: Partial<{
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    autoStartBreak: boolean;
    autoStartFocus: boolean;
  }>) => void;
  canUndo: boolean;
  onUndo: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onStartPause: () => void;
  onReset: () => void;
  focusState: PomodoroStatus;
  isFocusMode: boolean;
}) {
  const linkedPomodoroTask = tasks.find((task) => task.id === pomodoro.selectedTaskId);
  const isLocked = focusState === "running" || focusState === "paused" || focusState === "break";
  const statusText: Record<PomodoroStatus, string> = {
    idle: "開始待ち",
    running: "集中中",
    paused: "一時停止",
    break: "休憩中",
    completed: "完了",
  };

  const totalSeconds = pomodoro.mode === "focus" ? 25 * 60 : 5 * 60;
  const progress = Math.min(1, Math.max(0, 1 - pomodoro.remainingSeconds / totalSeconds));
  const ring = `conic-gradient(var(--accent) ${Math.round(progress * 360)}deg, rgba(148, 163, 184, 0.18) 0deg)`;

  return (
    <aside className="soft-scrollbar h-full overflow-y-auto pr-1">
      <div className="space-y-4 pb-4">
        <section
          className="surface rounded-[24px] p-6 transition duration-300"
          style={{
            boxShadow: isFocusMode ? "0 24px 80px rgba(0,0,0,0.28)" : "var(--shadow-panel)",
            borderColor: isFocusMode ? "var(--line-strong)" : "var(--line)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Pomodoro</div>
              <div className="mt-3 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: ring }}>
                  <div
                    className="grid h-[54px] w-[54px] place-items-center rounded-full text-xs font-semibold"
                    style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
                  >
                    {Math.round(progress * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-semibold tracking-tight">
                    {formatSeconds(pomodoro.remainingSeconds)}
                  </div>
                  <div className="mt-2 text-sm text-muted">{statusText[focusState]}</div>
                </div>
              </div>
            </div>
            <div
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: pomodoro.mode === "focus" ? "var(--accent-soft)" : "rgba(16, 185, 129, 0.12)",
                color: pomodoro.mode === "focus" ? "var(--accent)" : "var(--success)",
              }}
            >
              {pomodoro.mode === "focus" ? "Focus 25m" : "Break 5m"}
            </div>
          </div>

          <div className="mt-5 rounded-[20px] px-4 py-4" style={{ background: "var(--bg-muted)" }}>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Linked Task</div>
            <select
              className="mt-3 w-full rounded-[16px] border-0 px-3 py-3 text-sm outline-none"
              disabled={isLocked}
              onChange={(event) => onPomodoroTaskChange(event.target.value || null)}
              style={{ background: "var(--panel-strong)" }}
              value={pomodoro.selectedTaskId ?? ""}
            >
              <option value="">未選択</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {linkedPomodoroTask ? (
              <div className="mt-3 text-sm">
                <div className="font-medium">{linkedPomodoroTask.title}</div>
                <div className="mt-1 text-muted">
                  {formatMinute(linkedPomodoroTask.startMinute)} - {formatMinute(linkedPomodoroTask.endMinute)}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className="flex-1 rounded-full px-4 py-3 text-sm font-medium text-white transition"
              onClick={onStartPause}
              style={{ background: "var(--text)" }}
              type="button"
            >
              {pomodoro.isRunning ? "Pause" : focusState === "completed" ? "Restart" : "Start"}
            </button>
            <button
              aria-label="Reset pomodoro"
              className="rounded-full px-4 py-3 text-sm transition"
              onClick={onReset}
              style={{ background: "var(--bg-muted)" }}
              type="button"
            >
              <TimerReset className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 rounded-[20px] px-4 py-4" style={{ background: "var(--bg-muted)" }}>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Settings</div>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted">通知</span>
                <input
                  checked={pomodoroPreferences.notificationsEnabled}
                  onChange={(event) =>
                    onPomodoroPreferencesChange({ notificationsEnabled: event.target.checked })
                  }
                  type="checkbox"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted">サウンド</span>
                <input
                  checked={pomodoroPreferences.soundEnabled}
                  onChange={(event) =>
                    onPomodoroPreferencesChange({ soundEnabled: event.target.checked })
                  }
                  type="checkbox"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted">休憩を自動開始</span>
                <input
                  checked={pomodoroPreferences.autoStartBreak}
                  onChange={(event) =>
                    onPomodoroPreferencesChange({ autoStartBreak: event.target.checked })
                  }
                  type="checkbox"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted">集中を自動開始</span>
                <input
                  checked={pomodoroPreferences.autoStartFocus}
                  onChange={(event) =>
                    onPomodoroPreferencesChange({ autoStartFocus: event.target.checked })
                  }
                  type="checkbox"
                />
              </label>
            </div>
          </div>
        </section>

        <section
          className="surface rounded-[24px] p-6 transition duration-300"
          style={{
            opacity: isFocusMode ? (focusState === "running" ? 0.48 : 0.66) : 1,
            filter: isFocusMode ? "saturate(0.82)" : "none",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Task Detail</div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                {selectedTask?.title ?? "選択中のタスクはありません"}
              </h3>
            </div>
            {selectedTask ? (
              <button
                className="rounded-full px-3 py-2 text-sm transition"
                disabled={isLocked}
                onClick={() => onEditTask(selectedTask)}
                style={{ background: "var(--bg-muted)" }}
                type="button"
              >
                編集
              </button>
            ) : null}
          </div>

          {selectedTask ? (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock3 className="h-4 w-4" />
                {formatMinute(selectedTask.startMinute)} - {formatMinute(selectedTask.endMinute)}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  {selectedTask.category}
                </span>
                <span className="text-xs text-muted">Priority {selectedTask.priority}</span>
              </div>

              <p className="text-sm leading-6 text-muted">
                {selectedTask.memo || "メモはまだありません。"}
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 rounded-full px-4 py-3 text-sm font-medium text-white transition"
                  disabled={isLocked}
                  onClick={() => onToggleTaskCompletion(selectedTask.id)}
                  style={{ background: "var(--text)" }}
                  type="button"
                >
                  {selectedTask.completed ? "未完了に戻す" : "完了にする"}
                </button>
                <button
                  className="rounded-full px-4 py-3 text-sm transition"
                  disabled={isLocked}
                  onClick={() => onRemoveTask(selectedTask.id)}
                  style={{ background: "var(--bg-muted)", color: "var(--danger)" }}
                  type="button"
                >
                  削除
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              詳細は常時出さず、必要なときだけここに展開します。
            </p>
          )}
        </section>

        <section
          className="surface rounded-[24px] p-6 transition duration-300"
          style={{ opacity: isFocusMode ? 0.45 : 1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Daily Log</div>
              <div className="mt-2 text-lg font-semibold">実行実績</div>
            </div>
            <CalendarDays className="h-4 w-4 text-muted" />
          </div>
          <div className="mt-4 space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="rounded-[18px] px-4 py-3" style={{ background: "var(--bg-muted)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{log.taskTitle}</div>
                    <div className="mt-1 text-xs text-muted">
                      {format(new Date(log.completedAt), "HH:mm", { locale: ja })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{log.minutes}m</div>
                    <div className="mt-1 text-xs text-muted">{log.phase === "focus" ? "集中" : "休憩"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="surface rounded-[24px] p-5 transition duration-300"
          style={{ opacity: isFocusMode ? 0.38 : 1 }}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniStat icon={<CheckCheck className="h-4 w-4" />} label="Done" value={`${dashboard.completedTasks}`} />
            <MiniStat icon={<Coffee className="h-4 w-4" />} label="Focus" value={`${dashboard.pomodoroCount}`} />
            <MiniStat icon={<Clock3 className="h-4 w-4" />} label="Space" value={formatDuration(dashboard.freeMinutes)} />
          </div>
        </section>

        <section className="surface rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Tools</div>
              <div className="mt-2 text-lg font-semibold">Undo / Export</div>
            </div>
            <button
              aria-label="Undo"
              className="rounded-full p-2 transition"
              disabled={!canUndo || isLocked}
              onClick={onUndo}
              style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
              type="button"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm transition"
              onClick={onExport}
              style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
              type="button"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <label className="cursor-pointer">
              <input
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onImport(file);
                  event.target.value = "";
                }}
                type="file"
                accept="application/json"
              />
              <span
                className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm transition"
                style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
              >
                <Upload className="h-4 w-4" />
                Import
              </span>
            </label>
          </div>

          <p className="mt-3 text-xs text-muted">Undo は集中/休憩中は無効です。</p>
        </section>
      </div>
    </aside>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex justify-center text-muted">{icon}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">{label}</div>
    </div>
  );
}
