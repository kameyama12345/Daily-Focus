"use client";

import { useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import {
  CATEGORY_STYLES,
  END_HOUR,
  HOUR_HEIGHT,
  MINUTES_IN_DAY,
  START_HOUR,
} from "@/lib/constants";
import { clamp, formatMinute, minuteToOffset, offsetToMinute, snapMinute } from "@/lib/time";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FreeBlock {
  startMinute: number;
  endMinute: number;
}

function buildFreeBlocks(tasks: Task[]): FreeBlock[] {
  const sorted = [...tasks].sort((a, b) => a.startMinute - b.startMinute);
  const blocks: FreeBlock[] = [];
  let cursor = START_HOUR * 60;

  for (const task of sorted) {
    if (task.endMinute < START_HOUR * 60 || task.startMinute > END_HOUR * 60) continue;
    const start = Math.max(task.startMinute, START_HOUR * 60);
    const end = Math.min(task.endMinute, END_HOUR * 60);
    if (start > cursor) {
      blocks.push({ startMinute: cursor, endMinute: start });
    }
    cursor = Math.max(cursor, end);
  }

  if (cursor < END_HOUR * 60) {
    blocks.push({ startMinute: cursor, endMinute: END_HOUR * 60 });
  }

  return blocks.filter((block) => block.endMinute - block.startMinute >= 30);
}

export function TimelineBoard({
  tasks,
  selectedTaskId,
  onSelectTask,
  onEditTask,
  onUpdateTask,
}: {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onEditTask: (task: Task) => void;
  onUpdateTask: (taskId: string, startMinute: number, endMinute: number) => void;
}) {
  const [dragState, setDragState] = useState<{
    taskId: string;
    mode: "move" | "resize";
    originY: number;
    startMinute: number;
    endMinute: number;
  } | null>(null);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);
  const freeBlocks = useMemo(() => buildFreeBlocks(tasks), [tasks]);
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const currentOffset = minuteToOffset(currentMinute);

  function commitDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState) return;
    event.preventDefault();

    const minuteDelta = snapMinute(offsetToMinute(event.clientY - dragState.originY) - START_HOUR * 60);

    if (dragState.mode === "move") {
      const duration = dragState.endMinute - dragState.startMinute;
      const nextStart = clamp(
        dragState.startMinute + minuteDelta,
        START_HOUR * 60,
        END_HOUR * 60 - 15,
      );
      const nextEnd = clamp(nextStart + duration, START_HOUR * 60 + 15, MINUTES_IN_DAY);
      onUpdateTask(dragState.taskId, nextStart, nextEnd);
      return;
    }

    const nextEnd = clamp(
      dragState.endMinute + minuteDelta,
      dragState.startMinute + 15,
      END_HOUR * 60,
    );
    onUpdateTask(dragState.taskId, dragState.startMinute, nextEnd);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[24px]"
      style={{ background: "var(--panel-soft)", border: "1px solid var(--line)" }}
      onPointerMove={commitDrag}
      onPointerUp={() => setDragState(null)}
      onPointerLeave={() => setDragState(null)}
    >
      <div className="flex px-6 py-4">
        <div className="w-16 text-[11px] uppercase tracking-[0.24em] text-muted">Time</div>
        <div className="flex-1 text-[11px] uppercase tracking-[0.24em] text-muted">Schedule</div>
      </div>

      <div className="soft-scrollbar relative h-[760px] overflow-y-auto">
        <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
          {freeBlocks.map((block) => (
            <div
              key={`${block.startMinute}-${block.endMinute}`}
              className="absolute left-20 right-6 rounded-[20px]"
              style={{
                top: minuteToOffset(block.startMinute),
                height: minuteToOffset(block.endMinute) - minuteToOffset(block.startMinute),
                background: "var(--accent-soft)",
                border: "1px dashed var(--line)",
              }}
            >
              <div
                className="absolute right-4 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "var(--panel-strong)", color: "var(--accent)" }}
              >
                Focus window
              </div>
            </div>
          ))}

          {hours.slice(0, -1).map((hour) => (
            <div
              key={hour}
              className="absolute inset-x-0 flex"
              style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
            >
              <div className="w-20 px-6 text-xs font-medium text-muted">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="mr-6 flex-1 border-t" style={{ borderColor: "var(--line)" }} />
            </div>
          ))}

          {currentMinute >= START_HOUR * 60 && currentMinute <= END_HOUR * 60 ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
              style={{ top: currentOffset }}
            >
              <div className="w-20 px-6">
                <div
                  className="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white"
                  style={{ background: "var(--text)" }}
                >
                  Now
                </div>
              </div>
              <div className="mr-6 flex flex-1 items-center">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--text)" }} />
                <div className="h-px flex-1" style={{ background: "var(--line-strong)" }} />
              </div>
            </div>
          ) : null}

          {tasks.map((task) => {
            const top = minuteToOffset(task.startMinute);
            const height = Math.max(minuteToOffset(task.endMinute) - minuteToOffset(task.startMinute), 56);
            const categoryStyle = CATEGORY_STYLES[task.category];

            return (
              <button
                key={task.id}
                className={cn(
                  "absolute left-24 right-6 rounded-[20px] p-4 text-left transition duration-200",
                  dragState?.taskId === task.id && "scale-[1.01]",
                )}
                onClick={() => onSelectTask(task.id)}
                onDoubleClick={() => onEditTask(task)}
                style={{
                  top,
                  height,
                  background: task.completed ? "rgba(16, 185, 129, 0.12)" : "var(--panel-strong)",
                  border: `1px solid ${selectedTaskId === task.id ? "var(--line-strong)" : "var(--line)"}`,
                  boxShadow: dragState?.taskId === task.id ? "var(--shadow-panel)" : "none",
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", categoryStyle.color)} />
                      <p className="text-sm font-semibold">{task.title}</p>
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted">
                      {formatMinute(task.startMinute)} - {formatMinute(task.endMinute)}
                    </p>
                  </div>

                  <button
                    className="cursor-grab rounded-full p-2 active:cursor-grabbing"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      onSelectTask(task.id);
                      setDragState({
                        taskId: task.id,
                        mode: "move",
                        originY: event.clientY,
                        startMinute: task.startMinute,
                        endMinute: task.endMinute,
                      });
                    }}
                    style={{ background: "var(--bg-muted)", color: "var(--muted)" }}
                    type="button"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", categoryStyle.chip)}
                    style={{ opacity: 0.92 }}
                  >
                    {task.category}
                  </span>
                  {task.completed ? (
                    <span className="text-[11px] font-medium" style={{ color: "var(--success)" }}>
                      Completed
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{task.memo}</div>

                <button
                  className="absolute inset-x-6 bottom-2 h-1.5 cursor-ns-resize rounded-full"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectTask(task.id);
                    setDragState({
                      taskId: task.id,
                      mode: "resize",
                      originY: event.clientY,
                      startMinute: task.startMinute,
                      endMinute: task.endMinute,
                      });
                    }}
                    style={{ background: "var(--line-strong)" }}
                  type="button"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
