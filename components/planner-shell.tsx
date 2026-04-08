"use client";

import { useEffect, useState } from "react";
import { useDailyPlanner } from "@/hooks/use-daily-planner";
import { RECOMMENDED_SCHEDULE_PRESETS, TEMPLATE_SCHEDULE_PRESETS } from "@/lib/schedule-presets";
import { SchedulePreset, Task } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { HeaderActions } from "@/components/header-actions";
import { SchedulePresetModal } from "@/components/schedule-preset-modal";
import { TaskEditor } from "@/components/task-editor";
import { TimelineBoard } from "@/components/timeline-board";
import { SummaryPanel } from "@/components/summary-panel";
import { RightRail } from "@/components/right-rail";
import { applyTheme } from "@/components/theme-toggle";

export function PlannerShell() {
  const planner = useDailyPlanner();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTask, setEditorTask] = useState<Partial<Task> | null>(null);
  const [presetModal, setPresetModal] = useState<SchedulePreset["type"] | null>(null);
  const [pendingPreset, setPendingPreset] = useState<SchedulePreset | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

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

  function formatDateLabel(dateKey: string) {
    const [, month, day] = dateKey.split("-");
    return `${Number(month)}月${Number(day)}日`;
  }

  function onSelectPreset(preset: SchedulePreset) {
    const hasExistingSchedule = planner.tasks.length > 0;
    setPresetModal(null);

    if (!hasExistingSchedule) {
      planner.applySchedulePreset(preset);
      return;
    }

    setPendingPreset(preset);
    setConfirmReplaceOpen(true);
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

            <section
              className="surface relative flex h-full min-h-0 flex-col rounded-[28px] p-5 transition-[opacity,filter,background-color,border-color] duration-300 md:p-6"
              style={{
                background: isImmersiveMode ? "var(--focus-dim-surface)" : "var(--panel)",
                borderColor: isImmersiveMode ? "var(--line-strong)" : "var(--line)",
                opacity:
                  pomodoroStatus === "running" ? 0.78 : pomodoroStatus === "paused" ? 0.86 : pomodoroStatus === "break" ? 0.9 : 1,
                filter: isImmersiveMode ? "saturate(0.78)" : "none",
              }}
            >
              <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Schedule</div>
                <div className="flex flex-wrap items-center gap-2">
                  {isImmersiveMode ? (
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                      style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
                      編集ロック中（{statusCopy[pomodoroStatus]}）
                    </div>
                  ) : null}
                  <HeaderActions
                    disabled={isEditLocked}
                    onNewTask={() => {
                      setEditorTask(null);
                      setEditorOpen(true);
                    }}
                    onOpenRecommended={() => setPresetModal("recommended")}
                    onOpenTemplate={() => setPresetModal("template")}
                  />
                </div>
              </div>

              <div className="relative min-h-0 flex-1">
                <div
                  className="absolute inset-0 z-10 rounded-[24px] transition duration-300"
                  style={{
                    background:
                      pomodoroStatus === "running"
                        ? "rgba(10, 14, 22, 0.12)"
                        : pomodoroStatus === "paused"
                          ? "rgba(10, 14, 22, 0.08)"
                          : pomodoroStatus === "break"
                            ? "rgba(71, 85, 105, 0.05)"
                            : "transparent",
                    opacity: isImmersiveMode ? 1 : 0,
                    backdropFilter: isImmersiveMode ? "blur(2px) saturate(0.82)" : "blur(0px)",
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

      <SchedulePresetModal
        onClose={() => setPresetModal(null)}
        onSelect={onSelectPreset}
        open={presetModal === "recommended"}
        presets={RECOMMENDED_SCHEDULE_PRESETS}
        title="おすすめスケジュール"
      />
      <SchedulePresetModal
        onClose={() => setPresetModal(null)}
        onSelect={onSelectPreset}
        open={presetModal === "template"}
        presets={TEMPLATE_SCHEDULE_PRESETS}
        title="テンプレート"
      />

      <ConfirmDialog
        cancelLabel="キャンセル"
        confirmLabel="置き換える"
        message="現在のスケジュールを置き換えますか？"
        onCancel={() => {
          setConfirmReplaceOpen(false);
          setPendingPreset(null);
        }}
        onConfirm={() => {
          if (pendingPreset) planner.applySchedulePreset(pendingPreset);
          setConfirmReplaceOpen(false);
          setPendingPreset(null);
        }}
        open={confirmReplaceOpen}
        title="確認"
      />
    </main>
  );
}
