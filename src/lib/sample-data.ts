import { FOCUS_SECONDS } from "@/lib/constants";
import { PomodoroState, Task, WorkLog } from "@/lib/types";

export const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Quarterly plan review",
    startMinute: 8 * 60,
    endMinute: 9 * 60 + 30,
    category: "Meeting",
    priority: "High",
    memo: "Board deck final check and alignment.",
    completed: true,
  },
  {
    id: "task-2",
    title: "Strategy memo drafting",
    startMinute: 10 * 60,
    endMinute: 12 * 60,
    category: "Deep Work",
    priority: "High",
    memo: "Write the executive summary before lunch.",
    completed: false,
  },
  {
    id: "task-3",
    title: "Inbox zero",
    startMinute: 13 * 60,
    endMinute: 13 * 60 + 45,
    category: "Admin",
    priority: "Medium",
    memo: "Clear priority replies only.",
    completed: false,
  },
  {
    id: "task-4",
    title: "Product sync",
    startMinute: 14 * 60,
    endMinute: 15 * 60,
    category: "Meeting",
    priority: "Medium",
    memo: "Discuss launch blockers and owner handoff.",
    completed: false,
  },
  {
    id: "task-5",
    title: "Deep work block",
    startMinute: 15 * 60 + 30,
    endMinute: 17 * 60 + 30,
    category: "Deep Work",
    priority: "High",
    memo: "No meetings. Finalize proposal with headphones on.",
    completed: false,
  },
];

export const sampleLogs: WorkLog[] = [
  {
    id: "log-1",
    taskId: "task-2",
    taskTitle: "Strategy memo drafting",
    minutes: 25,
    phase: "focus",
    completedAt: new Date().toISOString(),
  },
  {
    id: "log-2",
    taskId: "task-5",
    taskTitle: "Deep work block",
    minutes: 25,
    phase: "focus",
    completedAt: new Date().toISOString(),
  },
];

export const initialPomodoro: PomodoroState = {
  mode: "focus",
  isRunning: false,
  remainingSeconds: FOCUS_SECONDS,
  selectedTaskId: "task-5",
  completedCount: 2,
  status: "idle",
  completedAt: null,
};
