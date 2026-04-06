"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import { useDailyPlanner } from "@/hooks/use-daily-planner";
import { Task } from "@/lib/types";
import { TaskEditor } from "@/components/task-editor";
import { TimelineBoard } from "@/components/timeline-board";
import { SummaryPanel } from "@/components/summary-panel";
import { RightRail } from "@/components/right-rail";
import { applyTheme } from "@/components/theme-toggle";

export function PlannerShell() {
  const planner = useDailyPlanner();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTask, setEditorTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    applyTheme(planner.preferences.theme);
  }, [planner.preferences.theme]);

  const focusSuggestion = planner.seedFocusSuggestion();
  const pomodoroStatus = planner.pomodoro.status;
  const isImmersiveMode =
    pomodoroStatus === "running" || pomodoroStatus === "paused" || pomodoroStatus === "break";
  const isEditLocked = isImmersiveMode;
  const viewMode = planner.preferences.viewMode;
  const statusCopy = {
    idle: "通常の作業ビュー",
    running: "集中モード中",
    paused: "一時停止中",
    break: "休憩モード",
    completed: "セッション完了",
  } as const;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditLocked) return;
      if (!planner.canUndo) return;
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      event.preventDefault();
      planner.undo();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditLocked, planner.canUndo, planner.undo]);

  function exportToFile() {
    const payload = planner.exportState();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-focus-${planner.selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importFromFile(file: File) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;
      planner.importState(payload);
    } catch {
      // ignore
    }
  }

  function formatDateLabel(dateKey: string) {
    const [, month, day] = dateKey.split("-");
    return `${Number(month)}月${Number(day)}日`;
  }

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
              onToggleTheme={() =>
                planner.setTheme(planner.preferences.theme === "dark" ? "light" : "dark")
              }
              onViewModeChange={planner.setViewMode}
              onDateChange={(dateKey) => {
                if (!isEditLocked) planner.setSelectedDate(dateKey);
              }}
              selectedDate={planner.selectedDate}
              theme={planner.preferences.theme}
              viewMode={viewMode}
              weekDates={planner.weekDates}
            />

            <section className="surface relative flex h-full min-h-0 flex-col rounded-[28px] p-5 md:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
                    {viewMode === "week" ? "Week" : "Day"} · {formatDateLabel(planner.selectedDate)}
                  </p>
                  <h2 className="mt-2 text-[32px] font-semibold tracking-tight">
                    {viewMode === "week" ? "1週間の流れを俯瞰する" : "タイムラインを主役にした1日"}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {statusCopy[pomodoroStatus]}。時間の流れを追いながら、必要な時だけ操作します。
                  </p>
                  {isImmersiveMode ? (
                    <div
                      className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                      style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
                      編集ロック中（{statusCopy[pomodoroStatus]}）
                    </div>
                  ) : null}
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
                  <button
                    className="rounded-full px-4 py-2.5 text-sm transition"
                    onClick={exportToFile}
                    style={{ background: "var(--bg-muted)" }}
                    type="button"
                  >
                    <Download className="mr-1 inline h-4 w-4" />
                    Export
                  </button>
                  <label className="cursor-pointer">
                    <input
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void importFromFile(file);
                        event.target.value = "";
                      }}
                      type="file"
                      accept="application/json"
                    />
                    <span
                      className="inline-flex items-center rounded-full px-4 py-2.5 text-sm transition"
                      style={{ background: "var(--bg-muted)" }}
                    >
                      <Upload className="mr-1 inline h-4 w-4" />
                      Import
                    </span>
                  </label>
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
                {viewMode === "week" ? (
                  <div
                    className="soft-scrollbar h-full overflow-y-auto rounded-[24px] p-6"
                    style={{ background: "var(--panel-soft)", border: "1px solid var(--line)" }}
                  >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {planner.weekDates.map((dateKey) => {
                        const summary = planner.getDashboard(dateKey);
                        const suggestion = planner.getFocusSuggestion(dateKey);
                        const isSelected = dateKey === planner.selectedDate;

                        return (
                          <button
                            key={dateKey}
                            className="rounded-[22px] p-5 text-left transition"
                            disabled={isEditLocked}
                            onClick={() => {
                              if (!isEditLocked) planner.setSelectedDate(dateKey);
                            }}
                            style={{
                              background: "var(--panel-strong)",
                              border: `1px solid ${isSelected ? "var(--line-strong)" : "var(--line)"}`,
                              boxShadow: isSelected ? "var(--shadow-panel)" : "none",
                              opacity: isEditLocked ? 0.65 : 1,
                            }}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">{formatDateLabel(dateKey)}</div>
                                <div className="mt-1 text-xs text-muted">
                                  Focus {summary.pomodoroCount} · Done {summary.completedTasks}
                                </div>
                              </div>
                              <div
                                className="rounded-full px-3 py-1 text-[11px] font-medium"
                                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                              >
                                Slot{" "}
                                {String(Math.floor(suggestion.startMinute / 60)).padStart(2, "0")}:
                                {String(suggestion.startMinute % 60).padStart(2, "0")}
                              </div>
                            </div>
                            <div
                              className="mt-4 grid grid-cols-2 gap-3 rounded-[18px] px-4 py-3"
                              style={{ background: "var(--bg-muted)" }}
                            >
                              <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Focus</div>
                                <div className="mt-1 text-lg font-semibold">
                                  {Math.round(summary.focusMinutes)}m
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Free</div>
                                <div className="mt-1 text-lg font-semibold">{Math.round(summary.freeMinutes)}m</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <TimelineBoard
                    disabled={isEditLocked}
                    focusState={pomodoroStatus}
                    tasks={planner.tasks}
                    onCreateTask={(startMinute, endMinute) => {
                      if (isEditLocked) return;
                      setEditorTask({ startMinute, endMinute, title: "" });
                      setEditorOpen(true);
                    }}
                    onEditTask={(task) => {
                      if (isEditLocked) return;
                      setEditorTask(task);
                      setEditorOpen(true);
                    }}
                    onSelectTask={planner.selectTask}
                    onUpdateTask={planner.updateTaskPosition}
                    selectedTaskId={planner.selectedTask?.id ?? null}
                  />
                )}
              </div>
            </section>

            <RightRail
              dashboard={planner.dashboard}
              focusState={pomodoroStatus}
              isFocusMode={isImmersiveMode}
              logs={planner.logs}
              canUndo={planner.canUndo}
              onEditTask={(task) => {
                if (isEditLocked) return;
                setEditorTask(task);
                setEditorOpen(true);
              }}
              onExport={exportToFile}
              onImport={importFromFile}
              onUndo={() => {
                if (isEditLocked) return;
                planner.undo();
              }}
              onPomodoroTaskChange={planner.setPomodoroTask}
              onPomodoroPreferencesChange={planner.updatePomodoroPreferences}
              onRemoveTask={planner.removeTask}
              onReset={planner.resetPomodoro}
              onStartPause={planner.pomodoro.isRunning ? planner.pausePomodoro : planner.startPomodoro}
              onToggleTaskCompletion={planner.toggleTaskCompletion}
              pomodoro={planner.pomodoro}
              pomodoroPreferences={planner.preferences}
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
