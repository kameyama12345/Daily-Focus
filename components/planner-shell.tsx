"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useDailyPlanner } from "@/hooks/use-daily-planner";
import { Task } from "@/lib/types";
import { TaskEditor } from "@/components/task-editor";
import { TimelineBoard } from "@/components/timeline-board";
import { SummaryPanel } from "@/components/summary-panel";
import { RightRail } from "@/components/right-rail";
import { ThemeMode, applyTheme } from "@/components/theme-toggle";

export function PlannerShell() {
  const planner = useDailyPlanner();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("daily-focus-theme") as ThemeMode | null;
    const nextTheme = storedTheme ?? "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("daily-focus-theme", theme);
  }, [theme]);

  const focusSuggestion = planner.seedFocusSuggestion();
  const pomodoroStatus = planner.pomodoro.status;
  const isImmersiveMode =
    pomodoroStatus === "running" || pomodoroStatus === "paused" || pomodoroStatus === "break";
  const isEditLocked = isImmersiveMode;
  const statusCopy = {
    idle: "通常の作業ビュー",
    running: "集中モード中",
    paused: "一時停止中",
    break: "休憩モード",
    completed: "セッション完了",
  } as const;

  return (
    <main className="h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto h-full max-w-[1680px]">
        <div
          className="relative h-full rounded-[32px] p-3 transition-[background,box-shadow,border-color] duration-300 md:p-4"
          style={{
            background: "var(--bg-elevated)",
            boxShadow: "var(--shadow-float)",
            border: "1px solid var(--line)",
            backgroundImage: "var(--shell-glow)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[32px] transition duration-300"
            style={{
              background: isImmersiveMode ? "rgba(6, 10, 17, 0.08)" : "transparent",
              opacity: isImmersiveMode ? 1 : 0,
            }}
          />

          <div className="relative grid h-full min-h-0 gap-4 xl:grid-cols-[280px_minmax(0,1.9fr)_320px]">
            <SummaryPanel
              dashboard={planner.dashboard}
              focusSuggestion={focusSuggestion}
              focusState={pomodoroStatus}
              isFocusMode={isImmersiveMode}
              onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              onViewModeChange={setViewMode}
              theme={theme}
              viewMode={viewMode}
            />

            <section className="surface relative flex h-full min-h-0 flex-col rounded-[28px] p-5 md:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Today</p>
                  <h2 className="mt-2 text-[32px] font-semibold tracking-tight">タイムラインを主役にした1日</h2>
                  <p className="mt-2 text-sm text-muted">
                    {statusCopy[pomodoroStatus]}。時間の流れを追いながら、必要な時だけ操作します。
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-full px-4 py-2.5 text-sm transition"
                    disabled={isEditLocked}
                    onClick={planner.addQuickTask}
                    style={{ background: "var(--bg-muted)" }}
                    type="button"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    1時間ブロック
                  </button>
                  <button
                    className="rounded-full px-4 py-2.5 text-sm text-white transition"
                    disabled={isEditLocked}
                    onClick={() => {
                      setEditorTask(null);
                      setEditorOpen(true);
                    }}
                    style={{ background: "var(--text)" }}
                    type="button"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    新規タスク
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1">
                <div
                  className="absolute inset-0 z-10 rounded-[24px] transition duration-300"
                  style={{
                    background:
                      pomodoroStatus === "running"
                        ? "rgba(10, 14, 22, 0.20)"
                        : pomodoroStatus === "paused"
                          ? "rgba(10, 14, 22, 0.12)"
                          : pomodoroStatus === "break"
                            ? "rgba(71, 85, 105, 0.08)"
                            : "transparent",
                    opacity: isImmersiveMode ? 1 : 0,
                    backdropFilter: isImmersiveMode ? "blur(3px) saturate(0.9)" : "blur(0px)",
                    pointerEvents: "none",
                  }}
                />
                <TimelineBoard
                  disabled={isEditLocked}
                  focusState={pomodoroStatus}
                  tasks={planner.tasks}
                  onEditTask={(task) => {
                    if (isEditLocked) return;
                    setEditorTask(task);
                    setEditorOpen(true);
                  }}
                  onSelectTask={planner.selectTask}
                  onUpdateTask={planner.updateTaskPosition}
                  selectedTaskId={planner.selectedTask?.id ?? null}
                />
              </div>
            </section>

            <RightRail
              dashboard={planner.dashboard}
              focusState={pomodoroStatus}
              isFocusMode={isImmersiveMode}
              logs={planner.logs}
              onEditTask={(task) => {
                if (isEditLocked) return;
                setEditorTask(task);
                setEditorOpen(true);
              }}
              onPomodoroTaskChange={planner.setPomodoroTask}
              onRemoveTask={planner.removeTask}
              onReset={planner.resetPomodoro}
              onStartPause={planner.pomodoro.isRunning ? planner.pausePomodoro : planner.startPomodoro}
              onToggleTaskCompletion={planner.toggleTaskCompletion}
              pomodoro={planner.pomodoro}
              selectedTask={planner.selectedTask}
              tasks={planner.tasks}
            />
          </div>
        </div>
      </div>

      <TaskEditor
        onClose={() => {
          setEditorOpen(false);
          setEditorTask(null);
        }}
        onSave={planner.saveTask}
        open={editorOpen && !isEditLocked}
        suggestedTask={editorTask}
      />
    </main>
  );
}
