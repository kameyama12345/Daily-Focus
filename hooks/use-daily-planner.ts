"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BREAK_SECONDS, FOCUS_SECONDS, MINUTES_IN_DAY } from "@/lib/constants";
import { initialPomodoro, sampleLogs, sampleTasks } from "@/lib/sample-data";
import { clamp, snapMinute } from "@/lib/time";
import { DashboardStats, PomodoroState, PomodoroStatus, SchedulePreset, Task, WorkLog } from "@/lib/types";
import { ThemeMode } from "@/components/theme-toggle";

const STORAGE_KEY = "daily-focus-state";
const DEFAULT_DURATION = 60;

type ViewMode = "day" | "week";

interface DayState {
  tasks: Task[];
  logs: WorkLog[];
}

interface PlannerPreferences {
  theme: ThemeMode;
  viewMode: ViewMode;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
}

interface PlannerStateV2 {
  version: 2;
  selectedDate: string; // YYYY-MM-DD (local date)
  days: Record<string, DayState>;
  pomodoro: PomodoroState;
  preferences: PlannerPreferences;
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

function computeFocusSuggestionFromTasks(tasks: Task[]) {
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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}

function toMinute(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
}

function defaultPreferences(partial?: Partial<PlannerPreferences>): PlannerPreferences {
  return {
    theme: partial?.theme ?? "dark",
    viewMode: partial?.viewMode ?? "day",
    notificationsEnabled: partial?.notificationsEnabled ?? false,
    soundEnabled: partial?.soundEnabled ?? false,
    autoStartBreak: partial?.autoStartBreak ?? false,
    autoStartFocus: partial?.autoStartFocus ?? false,
  };
}

function normalizePomodoro(pomodoro: PomodoroState): PomodoroState {
  return {
    ...pomodoro,
    status: pomodoro.status ?? getPomodoroStatus(pomodoro),
    completedAt: pomodoro.completedAt ?? null,
  };
}

function normalizeDayState(day: DayState | undefined): DayState {
  return {
    tasks: day?.tasks ?? [],
    logs: day?.logs ?? [],
  };
}

function migrateToV2(raw: unknown): PlannerStateV2 | null {
  const today = toDateKey(new Date());

  if (!raw || typeof raw !== "object") return null;

  const maybeV2 = raw as Partial<PlannerStateV2>;
  if (maybeV2.version === 2 && typeof maybeV2.selectedDate === "string" && maybeV2.days && maybeV2.pomodoro) {
    const preferences = defaultPreferences(maybeV2.preferences);
    const selectedDate = maybeV2.selectedDate || today;
    const days = maybeV2.days as Record<string, DayState>;
    return {
      version: 2,
      selectedDate,
      days: {
        ...days,
        [selectedDate]: normalizeDayState(days[selectedDate]),
      },
      pomodoro: normalizePomodoro(maybeV2.pomodoro as PomodoroState),
      preferences,
    };
  }

  // v1: { tasks, logs, pomodoro }
  const maybeV1 = raw as Partial<{ tasks: Task[]; logs: WorkLog[]; pomodoro: PomodoroState }>;
  if (Array.isArray(maybeV1.tasks) && Array.isArray(maybeV1.logs) && maybeV1.pomodoro) {
    const storedTheme = typeof window !== "undefined" ? (window.localStorage.getItem("daily-focus-theme") as ThemeMode | null) : null;
    return {
      version: 2,
      selectedDate: today,
      days: {
        [today]: {
          tasks: maybeV1.tasks,
          logs: maybeV1.logs,
        },
      },
      pomodoro: normalizePomodoro(maybeV1.pomodoro),
      preferences: defaultPreferences({ theme: storedTheme ?? "dark" }),
    };
  }

  return null;
}

function loadInitialState(): PlannerStateV2 {
  if (typeof window === "undefined") {
    const today = toDateKey(new Date());
    return {
      version: 2,
      selectedDate: today,
      days: { [today]: { tasks: sampleTasks, logs: sampleLogs } },
      pomodoro: initialPomodoro,
      preferences: defaultPreferences({ theme: "dark" }),
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const storedTheme = window.localStorage.getItem("daily-focus-theme") as ThemeMode | null;
    const today = toDateKey(new Date());
    return {
      version: 2,
      selectedDate: today,
      days: { [today]: { tasks: sampleTasks, logs: sampleLogs } },
      pomodoro: initialPomodoro,
      preferences: defaultPreferences({ theme: storedTheme ?? "dark" }),
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateToV2(parsed);
    if (migrated) return migrated;

    const storedTheme = window.localStorage.getItem("daily-focus-theme") as ThemeMode | null;
    const today = toDateKey(new Date());
    return {
      version: 2,
      selectedDate: today,
      days: { [today]: { tasks: sampleTasks, logs: sampleLogs } },
      pomodoro: initialPomodoro,
      preferences: defaultPreferences({ theme: storedTheme ?? "dark" }),
    };
  } catch {
    const storedTheme = window.localStorage.getItem("daily-focus-theme") as ThemeMode | null;
    const today = toDateKey(new Date());
    return {
      version: 2,
      selectedDate: today,
      days: { [today]: { tasks: sampleTasks, logs: sampleLogs } },
      pomodoro: initialPomodoro,
      preferences: defaultPreferences({ theme: storedTheme ?? "dark" }),
    };
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
  const [state, setState] = useState<PlannerStateV2>(loadInitialState);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [historySize, setHistorySize] = useState(0);
  const lastNotifiedAtRef = useRef<string | null>(null);
  const historyRef = useRef<
    Array<{
      selectedDate: string;
      day: DayState;
      pomodoro: PomodoroState;
    }>
  >([]);

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

        const activeDate = current.selectedDate;
        const activeDay = normalizeDayState(current.days[activeDate]);

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
        const linkedTask = activeDay.tasks.find(
          (task) => task.id === current.pomodoro.selectedTaskId,
        );

        const nextMode = isFocusComplete ? "break" : "focus";
        const nextSecondsReset = isFocusComplete ? BREAK_SECONDS : FOCUS_SECONDS;
        const shouldAutoStart =
          nextMode === "break" ? current.preferences.autoStartBreak : current.preferences.autoStartFocus;

        return {
          ...current,
          days: {
            ...current.days,
            [activeDate]: {
              ...activeDay,
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
                    ...activeDay.logs,
                  ]
                : activeDay.logs,
            },
          },
          pomodoro: {
            ...current.pomodoro,
            mode: nextMode,
            isRunning: shouldAutoStart,
            completedCount: isFocusComplete
              ? current.pomodoro.completedCount + 1
              : current.pomodoro.completedCount,
            remainingSeconds: nextSecondsReset,
            completedAt: isFocusComplete ? new Date().toISOString() : null,
            status: isFocusComplete ? "completed" : shouldAutoStart ? "running" : "idle",
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.pomodoro.isRunning]);

  useEffect(() => {
    const activeDay = normalizeDayState(state.days[state.selectedDate]);
    if (!selectedTaskId && activeDay.tasks.length > 0) {
      setSelectedTaskId(activeDay.tasks[0]?.id ?? null);
    }
    if (selectedTaskId && !activeDay.tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(activeDay.tasks[0]?.id ?? null);
    }
  }, [selectedTaskId, state.days, state.selectedDate]);

  const dayState = useMemo(
    () => normalizeDayState(state.days[state.selectedDate]),
    [state.days, state.selectedDate],
  );

  const tasks = useMemo(() => [...dayState.tasks].sort((a, b) => a.startMinute - b.startMinute), [dayState.tasks]);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ??
    tasks.find((task) => task.id === state.pomodoro.selectedTaskId) ??
    null;

  const dashboard: DashboardStats = useMemo(() => {
    const focusMinutes = dayState.logs.filter((log) => log.phase === "focus").reduce((sum, log) => sum + log.minutes, 0);

    return {
      focusMinutes,
      completedTasks: dayState.tasks.filter((task) => task.completed).length,
      activeTasks: dayState.tasks.filter((task) => !task.completed).length,
      freeMinutes: computeFreeMinutes(dayState.tasks),
      pomodoroCount: dayState.logs.filter((log) => log.phase === "focus").length,
    };
  }, [dayState.logs, dayState.tasks]);

  function pushHistory(snapshot: { selectedDate: string; day: DayState; pomodoro: PomodoroState }) {
    historyRef.current.push({
      selectedDate: snapshot.selectedDate,
      day: JSON.parse(JSON.stringify(snapshot.day)) as DayState,
      pomodoro: JSON.parse(JSON.stringify(snapshot.pomodoro)) as PomodoroState,
    });
    if (historyRef.current.length > 30) {
      historyRef.current.shift();
    }
    setHistorySize(historyRef.current.length);
  }

  function undo() {
    const entry = historyRef.current.pop();
    if (!entry) return;
    setHistorySize(historyRef.current.length);
    setState((current) => ({
      ...current,
      selectedDate: entry.selectedDate,
      days: {
        ...current.days,
        [entry.selectedDate]: entry.day,
      },
      pomodoro: entry.pomodoro,
    }));
    setSelectedTaskId(entry.day.tasks[0]?.id ?? null);
  }

  function saveTask(task: Partial<Task> & Pick<Task, "title">) {
    const nextId = task.id ?? createTaskId();

    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

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

      const exists = activeDay.tasks.some((item) => item.id === normalizedTask.id);
      const nextTasks = exists
        ? activeDay.tasks.map((item) => (item.id === normalizedTask.id ? normalizedTask : item))
        : [...activeDay.tasks, normalizedTask];

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            ...activeDay,
            tasks: nextTasks,
          },
        },
      };
    });

    setSelectedTaskId(nextId);
  }

  function updateTaskPosition(taskId: string, startMinute: number, endMinute: number) {
    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            ...activeDay,
            tasks: activeDay.tasks.map((task) =>
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
          },
        },
      };
    });
  }

  function removeTask(taskId: string) {
    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            tasks: activeDay.tasks.filter((task) => task.id !== taskId),
            logs: activeDay.logs.filter((log) => log.taskId !== taskId),
          },
        },
        pomodoro:
          current.pomodoro.selectedTaskId === taskId
            ? { ...current.pomodoro, selectedTaskId: null, isRunning: false, status: "idle" }
            : current.pomodoro,
      };
    });

    setSelectedTaskId((current) => (current === taskId ? null : current));
  }

  function toggleTaskCompletion(taskId: string) {
    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            ...activeDay,
            tasks: activeDay.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task,
            ),
          },
        },
      };
    });
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
    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            ...activeDay,
            tasks: [...activeDay.tasks, task],
          },
        },
      };
    });
    setSelectedTaskId(task.id);
  }

  function applySchedulePreset(preset: SchedulePreset) {
    const nextTasks: Task[] = preset.items
      .map((item) => {
        const startMinute = clamp(snapMinute(toMinute(item.start)), 0, MINUTES_IN_DAY - 15);
        const endMinute = clamp(snapMinute(toMinute(item.end)), 15, MINUTES_IN_DAY);
        const normalizedEnd = endMinute <= startMinute ? clamp(startMinute + 30, 15, MINUTES_IN_DAY) : endMinute;

        return {
          id: createTaskId(),
          title: item.title,
          startMinute,
          endMinute: normalizedEnd,
          category: item.category ?? "Deep Work",
          priority: item.priority ?? "Medium",
          memo: "",
          completed: false,
        };
      })
      .sort((a, b) => a.startMinute - b.startMinute);

    setState((current) => {
      const activeDate = current.selectedDate;
      const activeDay = normalizeDayState(current.days[activeDate]);
      pushHistory({ selectedDate: activeDate, day: activeDay, pomodoro: current.pomodoro });

      const nextPomodoroSelected = nextTasks[0]?.id ?? null;

      return {
        ...current,
        days: {
          ...current.days,
          [activeDate]: {
            ...activeDay,
            tasks: nextTasks,
          },
        },
        pomodoro: {
          ...current.pomodoro,
          selectedTaskId: nextPomodoroSelected,
        },
      };
    });

    setSelectedTaskId(nextTasks[0]?.id ?? null);
  }

  function selectTask(taskId: string | null) {
    setSelectedTaskId(taskId);
  }

  function setPomodoroTask(taskId: string | null) {
    setState((current) => {
      pushHistory({
        selectedDate: current.selectedDate,
        day: normalizeDayState(current.days[current.selectedDate]),
        pomodoro: current.pomodoro,
      });

      return {
        ...current,
        pomodoro: { ...current.pomodoro, selectedTaskId: taskId },
      };
    });
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
    return computeFocusSuggestionFromTasks(tasks);
  }

  function getDay(dateKey: string): DayState {
    return normalizeDayState(state.days[dateKey]);
  }

  function getDashboard(dateKey: string): DashboardStats {
    const day = getDay(dateKey);
    const focusMinutes = day.logs.filter((log) => log.phase === "focus").reduce((sum, log) => sum + log.minutes, 0);

    return {
      focusMinutes,
      completedTasks: day.tasks.filter((task) => task.completed).length,
      activeTasks: day.tasks.filter((task) => !task.completed).length,
      freeMinutes: computeFreeMinutes(day.tasks),
      pomodoroCount: day.logs.filter((log) => log.phase === "focus").length,
    };
  }

  function getFocusSuggestion(dateKey: string) {
    const day = getDay(dateKey);
    return computeFocusSuggestionFromTasks(day.tasks);
  }

  function setTheme(theme: ThemeMode) {
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, theme },
    }));
  }

  function setViewMode(viewMode: ViewMode) {
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, viewMode },
    }));
  }

  function updatePomodoroPreferences(next: Partial<Pick<PlannerPreferences, "notificationsEnabled" | "soundEnabled" | "autoStartBreak" | "autoStartFocus">>) {
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, ...next },
    }));
  }

  function setSelectedDate(dateKey: string) {
    setState((current) => {
      if (current.selectedDate === dateKey) return current;
      const ensured = current.days[dateKey] ? current.days[dateKey] : { tasks: [], logs: [] };
      return {
        ...current,
        selectedDate: dateKey,
        days: {
          ...current.days,
          [dateKey]: ensured,
        },
      };
    });
    setSelectedTaskId(null);
  }

  const weekDates = useMemo(() => {
    const base = state.selectedDate;
    return Array.from({ length: 5 }, (_, index) => addDays(base, index));
  }, [state.selectedDate]);

  function exportState() {
    return {
      version: 2,
      selectedDate: state.selectedDate,
      days: state.days,
      pomodoro: state.pomodoro,
      preferences: state.preferences,
    };
  }

  function importState(payload: unknown) {
    try {
      const migrated = migrateToV2(payload);
      if (!migrated) return false;

      setState({
        ...migrated,
        preferences: defaultPreferences(migrated.preferences),
      });
      setSelectedTaskId(null);
      historyRef.current = [];
      setHistorySize(0);
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (!isHydrated) return;
    if (!state.preferences.notificationsEnabled && !state.preferences.soundEnabled) return;
    if (state.pomodoro.status !== "completed") return;
    if (!state.pomodoro.completedAt) return;
    if (lastNotifiedAtRef.current === state.pomodoro.completedAt) return;
    lastNotifiedAtRef.current = state.pomodoro.completedAt;

    if (state.preferences.soundEnabled) {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.value = 0.06;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        window.setTimeout(() => {
          oscillator.stop();
          context.close();
        }, 140);
      } catch {
        // ignore
      }
    }

    if (state.preferences.notificationsEnabled) {
      const notify = async () => {
        try {
          if (!("Notification" in window)) return;
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
          if (Notification.permission !== "granted") return;
          const activeDay = normalizeDayState(state.days[state.selectedDate]);
          const latest = activeDay.logs.find((log) => log.phase === "focus");
          new Notification("Daily Focus", {
            body: latest ? `集中25分完了：${latest.taskTitle}` : "集中セッションが完了しました",
          });
        } catch {
          // ignore
        }
      };
      void notify();
    }
  }, [isHydrated, state.days, state.preferences.notificationsEnabled, state.preferences.soundEnabled, state.pomodoro.status, state.selectedDate]);

  return {
    tasks,
    logs: dayState.logs,
    pomodoro: state.pomodoro,
    selectedTask,
    dashboard,
    isHydrated,
    selectedDate: state.selectedDate,
    weekDates,
    preferences: state.preferences,
    canUndo: historySize > 0,
    saveTask,
    removeTask,
    updateTaskPosition,
    toggleTaskCompletion,
    addQuickTask,
    applySchedulePreset,
    selectTask,
    setPomodoroTask,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    seedFocusSuggestion,
    undo,
    setTheme,
    setViewMode,
    updatePomodoroPreferences,
    setSelectedDate,
    exportState,
    importState,
    getDay,
    getDashboard,
    getFocusSuggestion,
  };
}
