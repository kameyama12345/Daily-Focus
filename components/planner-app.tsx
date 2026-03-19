"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  Clock3,
  Coffee,
  Focus,
  Plus,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { useDailyPlanner } from "@/hooks/use-daily-planner";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatDuration, formatMinute, formatSeconds } from "@/lib/time";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskEditor } from "@/components/task-editor";
import { TimelineBoard } from "@/components/timeline-board";

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="glass rounded-[28px] border border-white/70 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export function PlannerApp() {
  const planner = useDailyPlanner();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const today = new Date();
  const linkedPomodoroTask = planner.tasks.find(
    (task) => task.id === planner.pomodoro.selectedTaskId,
  );
  const focusSuggestion = planner.seedFocusSuggestion();

  const weekStrip = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const date = addDays(today, index);
        return {
          label: format(date, "E", { locale: ja }),
          day: format(date, "d"),
          isToday: index === 0,
        };
      }),
    [today],
  );

  return (
    <main className="min-h-screen bg-halo px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="rounded-[36px] border border-white/70 bg-white/60 p-3 shadow-float backdrop-blur-xl sm:p-4">
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="glass rounded-[30px] border border-white/70 p-5 shadow-panel">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Daily Focus</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {format(today, "M月d日", { locale: ja })}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {format(today, "EEEE", { locale: ja })}の流れを整える
                  </p>
                </div>
                <button
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => {
                    setEditorTask(null);
                    setEditorOpen(true);
                  }}
                  type="button"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  新規
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <SummaryCard
                  label="集中時間"
                  value={formatDuration(planner.dashboard.focusMinutes)}
                  detail="今日の積み上げ"
                  icon={Focus}
                />
                <SummaryCard
                  label="空き時間"
                  value={formatDuration(planner.dashboard.freeMinutes)}
                  detail="深い作業に回せる余白"
                  icon={Sparkles}
                />
                <SummaryCard
                  label="完了タスク"
                  value={`${planner.dashboard.completedTasks}`}
                  detail="静かに前進"
                  icon={CheckCheck}
                />
                <SummaryCard
                  label="ポモドーロ"
                  value={`${planner.dashboard.pomodoroCount}`}
                  detail="完了セッション"
                  icon={Coffee}
                />
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">View</p>
                    <p className="text-xs text-slate-500">日次を主役にしつつ、週感覚も軽く確認</p>
                  </div>
                  <div className="rounded-full bg-white p-1 shadow-sm">
                    {(["day", "week"] as const).map((mode) => (
                      <button
                        key={mode}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm transition",
                          viewMode === mode
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:text-slate-900",
                        )}
                        onClick={() => setViewMode(mode)}
                        type="button"
                      >
                        {mode === "day" ? "Day" : "Week"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {weekStrip.map((item) => (
                    <div
                      key={`${item.label}-${item.day}`}
                      className={cn(
                        "rounded-2xl border px-3 py-4 text-center",
                        item.isToday
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-white bg-white text-slate-600",
                      )}
                    >
                      <div className="text-xs uppercase tracking-[0.2em]">{item.label}</div>
                      <div className="mt-2 text-xl font-semibold">{item.day}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-blue-100 bg-blue-50/80 p-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">おすすめ集中時間</span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  {formatMinute(focusSuggestion.startMinute)} - {formatMinute(focusSuggestion.endMinute)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  タスクの隙間から、まとまった1時間を自動で抽出しています。提案された時間帯を深い作業の
                  固定席として使えます。
                </p>
              </div>
            </aside>

            <section className="glass min-h-[860px] rounded-[30px] border border-white/70 p-4 shadow-panel sm:p-5">
              <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today&apos;s Flow</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    タイムラインが主役の1日設計
                  </h2>
                </div>
                <button
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={planner.addQuickTask}
                  type="button"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  1時間ブロックを追加
                </button>
              </div>

              <TimelineBoard
                tasks={planner.tasks}
                onEditTask={(task) => {
                  setEditorTask(task);
                  setEditorOpen(true);
                }}
                onSelectTask={planner.selectTask}
                onUpdateTask={planner.updateTaskPosition}
                selectedTaskId={planner.selectedTask?.id ?? null}
              />
            </section>

            <aside className="space-y-4">
              <div className="glass rounded-[30px] border border-white/70 p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pomodoro</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {formatSeconds(planner.pomodoro.remainingSeconds)}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      planner.pomodoro.mode === "focus"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {planner.pomodoro.mode === "focus" ? "Focus 25m" : "Break 5m"}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Linked Task</p>
                  <select
                    className="mt-2 w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm outline-none ring-0"
                    onChange={(event) => planner.setPomodoroTask(event.target.value || null)}
                    value={planner.pomodoro.selectedTaskId ?? ""}
                  >
                    <option value="">未選択</option>
                    {planner.tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                  {linkedPomodoroTask ? (
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{linkedPomodoroTask.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatMinute(linkedPomodoroTask.startMinute)} -{" "}
                          {formatMinute(linkedPomodoroTask.endMinute)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium",
                          CATEGORY_STYLES[linkedPomodoroTask.category].chip,
                        )}
                      >
                        {linkedPomodoroTask.category}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                    onClick={planner.pomodoro.isRunning ? planner.pausePomodoro : planner.startPomodoro}
                    type="button"
                  >
                    {planner.pomodoro.isRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    onClick={planner.pausePomodoro}
                    type="button"
                  >
                    Stop
                  </button>
                  <button
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    onClick={planner.resetPomodoro}
                    type="button"
                  >
                    <TimerReset className="mx-auto h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="glass rounded-[30px] border border-white/70 p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Task Detail</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {planner.selectedTask?.title ?? "タスクを選択"}
                    </h3>
                  </div>
                  {planner.selectedTask ? (
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-300"
                      onClick={() => {
                        setEditorTask(planner.selectedTask);
                        setEditorOpen(true);
                      }}
                      type="button"
                    >
                      編集
                    </button>
                  ) : null}
                </div>

                {planner.selectedTask ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium",
                          CATEGORY_STYLES[planner.selectedTask.category].chip,
                        )}
                      >
                        {planner.selectedTask.category}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                        Priority {planner.selectedTask.priority}
                      </span>
                    </div>
                    <div className="rounded-[24px] bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        {formatMinute(planner.selectedTask.startMinute)} -{" "}
                        {formatMinute(planner.selectedTask.endMinute)}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {planner.selectedTask.memo || "メモはまだありません。"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                        onClick={() => planner.toggleTaskCompletion(planner.selectedTask!.id)}
                        type="button"
                      >
                        {planner.selectedTask.completed ? "未完了に戻す" : "完了にする"}
                      </button>
                      <button
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                        onClick={() => planner.removeTask(planner.selectedTask!.id)}
                        type="button"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    タイムライン上のブロックをクリックすると、詳細や編集がここに表示されます。
                  </p>
                )}
              </div>

              <div className="glass rounded-[30px] border border-white/70 p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Daily Log</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">実行実績</h3>
                  </div>
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-3">
                  {planner.logs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-[22px] border border-slate-200/80 bg-white/80 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{log.taskTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {format(new Date(log.completedAt), "HH:mm", { locale: ja })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{log.minutes}m</p>
                          <p className="text-xs text-slate-500">
                            {log.phase === "focus" ? "集中" : "休憩"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <TaskEditor
        onClose={() => {
          setEditorOpen(false);
          setEditorTask(null);
        }}
        onSave={planner.saveTask}
        open={editorOpen}
        suggestedTask={editorTask}
      />
    </main>
  );
}
