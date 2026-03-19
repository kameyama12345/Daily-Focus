export type Category = "Deep Work" | "Meeting" | "Admin" | "Personal";
export type Priority = "Low" | "Medium" | "High";
export type PomodoroPhase = "focus" | "break";
export type PomodoroStatus = "idle" | "running" | "paused" | "break" | "completed";

export interface Task {
  id: string;
  title: string;
  startMinute: number;
  endMinute: number;
  category: Category;
  priority: Priority;
  memo: string;
  completed: boolean;
}

export interface WorkLog {
  id: string;
  taskId: string | null;
  taskTitle: string;
  minutes: number;
  phase: PomodoroPhase;
  completedAt: string;
}

export interface PomodoroState {
  mode: PomodoroPhase;
  isRunning: boolean;
  remainingSeconds: number;
  selectedTaskId: string | null;
  completedCount: number;
  status: PomodoroStatus;
  completedAt: string | null;
}

export interface DashboardStats {
  focusMinutes: number;
  completedTasks: number;
  activeTasks: number;
  freeMinutes: number;
  pomodoroCount: number;
}
