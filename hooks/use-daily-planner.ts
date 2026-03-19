"use client";

import { useEffect, useMemo, useState } from "react";
import { BREAK_SECONDS, FOCUS_SECONDS, MINUTES_IN_DAY } from "@/lib/constants";
import { initialPomodoro, sampleLogs, sampleTasks } from "@/lib/sample-data";
import { clamp, snapMinute } from "@/lib/time";
import { DashboardStats, PomodoroState, PomodoroStatus, Task, WorkLog } from "@/lib/types";

const STORAGE_KEY = "daily-focus-state";
const DEFAULT_DURATION = 60;

interface PlannerState {
  tasks: Task[];
  logs: WorkLog[];
  pomodoro: PomodoroState;
}

function createTaskId() {
  return `task-${Math.random().toString(36).slice(2, 9)}`;
}

function createLogId() {
  return `log-${Math.random().toString(36).slice(2, 9)}`;
}

function computeFreeMinutes(tasks: Task[]) {
  const sorted = [...tasks].sort((a, b) => a.startMinute - b.startMinute);
  let free = 0;
  let cursor = 0;

  for (const task of sorted) {
    if (task.startMinute > cursor) {
      free += task.startMinute - cursor;
    }
    cursor = Math.max(cursor, task.endMinute);
  }

  if (cursor < MINUTES_IN_DAY) {
    free += MINUTES_IN_DAY - cursor;
  }

  return free;
}

function loadInitialState(): PlannerState {
  if (typeof window === "undefined") {
    return { tasks: sampleTasks, logs: sampleLogs, pomodoro: initialPomodoro };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { tasks: sampleTasks, logs: sampleLogs, pomodoro: initialPomodoro };
  }

  try {
    const parsed = JSON.parse(raw) as PlannerState;
    return {
      ...parsed,
      pomodoro: {
        ...parsed.pomodoro,
        status: parsed.pomodoro.status ?? getPomodoroStatus(parsed.pomodoro),
        completedAt: parsed.pomodoro.completedAt ?? null,
      },
    };
  } catch {
    return { tasks: sampleTasks, logs: sampleLogs, pomodoro: initialPomodoro };
  }
}

function getPomodoroStatus(
  partial: Pick<PomodoroState, "mode" | "isRunning" | "remainingSeconds" | "completedAt">,
): PomodoroStatus {
  if (partial.isRunning) {
    return partial.mode === "break" ? "break" : "running";
  }
  if (partial.completedAt) {
    return "completed";
  }
  if (partial.mode === "break" && partial.remainingSeconds < BREAK_SECONDS) {
    return "paused";
  }
  if (partial.mode === "focus" && partial.remainingSeconds < FOCUS_SECONDS) {
    return "paused";
  }
  return "idle";
}

export function useDailyPlanner() {
  const [state, setState] = useState<PlannerState>(loadInitialState);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(sampleTasks[1]?.id ?? null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  useEffect(() => {
    if (!state.pomodoro.isRunning) return;

    const timer = window.setInterval(() => {
      setState((current) => {
        if (!current.pomodoro.isRunning) {
          return current;
        }

        const nextSeconds = current.pomodoro.remainingSeconds - 1;
        if (nextSeconds > 0) {
          return {
            ...current,
            pomodoro: {
              ...current.pomodoro,
              remainingSeconds: nextSeconds,
              status: current.pomodoro.mode === "break" ? "break" : "running",
            },
          };
        }

        const isFocusComplete = current.pomodoro.mode === "focus";
        const linkedTask = current.tasks.find(
          (task) => task.id === current.pomodoro.selectedTaskId,
        );

        return {
          ...current,
          logs: isFocusComplete
            ? [
                {
                  id: createLogId(),
                  taskId: linkedTask?.id ?? null,
                  taskTitle: linkedTask?.title ?? "Unassigned focus",
                  minutes: 25,
                  phase: "focus",
                  completedAt: new Date().toISOString(),
                },
                ...current.logs,
              ]
            : current.logs,
          pomodoro: {
            ...current.pomodoro,
            mode: isFocusComplete ? "break" : "focus",
            isRunning: false,
            completedCount: isFocusComplete
              ? current.pomodoro.completedCount + 1
              : current.pomodoro.completedCount,
            remainingSeconds: isFocusComplete ? BREAK_SECONDS : FOCUS_SECONDS,
            completedAt: isFocusComplete ? new Date().toISOString() : null,
            status: isFocusComplete ? "completed" : "idle",
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.pomodoro.isRunning]);

  const tasks = useMemo(
    () => [...state.tasks].sort((a, b) => a.startMinute - b.startMinute),
    [state.tasks],
  );

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ??
    tasks.find((task) => task.id === state.pomodoro.selectedTaskId) ??
    null;

  const dashboard: DashboardStats = useMemo(() => {
    const focusMinutes = state.logs
      .filter((log) => log.phase === "focus")
      .reduce((sum, log) => sum + log.minutes, 0);

    return {
      focusMinutes,
      completedTasks: state.tasks.filter((task) => task.completed).length,
      activeTasks: state.tasks.filter((task) => !task.completed).length,
      freeMinutes: computeFreeMinutes(state.tasks),
      pomodoroCount: state.pomodoro.completedCount,
    };
  }, [state.logs, state.pomodoro.completedCount, state.tasks]);

  function saveTask(task: Partial<Task> & Pick<Task, "title">) {
    const nextId = task.id ?? createTaskId();

    setState((current) => {
      const normalizedTask: Task = {
        id: nextId,
        title: task.title,
        startMinute: clamp(snapMinute(task.startMinute ?? 9 * 60), 0, MINUTES_IN_DAY - 15),
        endMinute: clamp(
          snapMinute(task.endMinute ?? (task.startMinute ?? 9 * 60) + DEFAULT_DURATION),
          15,
          MINUTES_IN_DAY,
        ),
        category: task.category ?? "Deep Work",
        priority: task.priority ?? "Medium",
        memo: task.memo ?? "",
        completed: task.completed ?? false,
      };

      if (normalizedTask.endMinute <= normalizedTask.startMinute) {
        normalizedTask.endMinute = clamp(
          normalizedTask.startMinute + DEFAULT_DURATION,
          15,
          MINUTES_IN_DAY,
        );
      }

      const exists = current.tasks.some((item) => item.id === normalizedTask.id);
      const nextTasks = exists
        ? current.tasks.map((item) => (item.id === normalizedTask.id ? normalizedTask : item))
        : [...current.tasks, normalizedTask];

      return { ...current, tasks: nextTasks };
    });

    setSelectedTaskId(nextId);
  }

  function updateTaskPosition(taskId: string, startMinute: number, endMinute: number) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              startMinute: clamp(snapMinute(startMinute), 0, MINUTES_IN_DAY - 15),
              endMinute: clamp(
                Math.max(snapMinute(endMinute), snapMinute(startMinute) + 15),
                15,
                MINUTES_IN_DAY,
              ),
            }
          : task,
      ),
    }));
  }

  function removeTask(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
      logs: current.logs.filter((log) => log.taskId !== taskId),
      pomodoro:
        current.pomodoro.selectedTaskId === taskId
          ? { ...current.pomodoro, selectedTaskId: null, isRunning: false }
          : current.pomodoro,
    }));

    setSelectedTaskId((current) => (current === taskId ? null : current));
  }

  function toggleTaskCompletion(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  }

  function addQuickTask() {
    const task: Task = {
      id: createTaskId(),
      title: "New focus block",
      startMinute: 16 * 60,
      endMinute: 17 * 60,
      category: "Deep Work",
      priority: "Medium",
      memo: "",
      completed: false,
    };
    setState((current) => ({ ...current, tasks: [...current.tasks, task] }));
    setSelectedTaskId(task.id);
  }

  function selectTask(taskId: string | null) {
    setSelectedTaskId(taskId);
  }

  function setPomodoroTask(taskId: string | null) {
    setState((current) => ({
      ...current,
      pomodoro: { ...current.pomodoro, selectedTaskId: taskId },
    }));
  }

  function startPomodoro() {
    setState((current) => ({
      ...current,
      pomodoro: {
        ...current.pomodoro,
        isRunning: true,
        completedAt: null,
        status: current.pomodoro.mode === "break" ? "break" : "running",
      },
    }));
  }

  function pausePomodoro() {
    setState((current) => ({
      ...current,
      pomodoro: {
        ...current.pomodoro,
        isRunning: false,
        status: getPomodoroStatus({
          mode: current.pomodoro.mode,
          isRunning: false,
          remainingSeconds: current.pomodoro.remainingSeconds,
          completedAt: null,
        }),
      },
    }));
  }

  function resetPomodoro() {
    setState((current) => ({
      ...current,
      pomodoro: {
        ...current.pomodoro,
        isRunning: false,
        mode: "focus",
        remainingSeconds: FOCUS_SECONDS,
        status: "idle",
        completedAt: null,
      },
    }));
  }

  function seedFocusSuggestion() {
    const sorted = [...tasks].sort((a, b) => a.startMinute - b.startMinute);
    let cursor = 9 * 60;
    for (const task of sorted) {
      if (task.startMinute - cursor >= 60) {
        return { startMinute: cursor, endMinute: cursor + 60 };
      }
      cursor = Math.max(cursor, task.endMinute);
    }
    return { startMinute: 18 * 60, endMinute: 19 * 60 };
  }

  return {
    tasks,
    logs: state.logs,
    pomodoro: state.pomodoro,
    selectedTask,
    dashboard,
    isHydrated,
    saveTask,
    removeTask,
    updateTaskPosition,
    toggleTaskCompletion,
    addQuickTask,
    selectTask,
    setPomodoroTask,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    seedFocusSuggestion,
  };
}
