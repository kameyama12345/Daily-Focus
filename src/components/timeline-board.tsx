"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import {
  CATEGORY_STYLES,
  END_HOUR,
  HOUR_HEIGHT,
  MINUTES_IN_DAY,
  SNAP_MINUTES,
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
  onCreateTask,
  onDropExternalTask,
  onRemoveTask,
  onUpdateTask,
  disabled,
  focusState,
}: {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (startMinute: number, endMinute: number) => void;
  onDropExternalTask?: (payload: { title: string; startMinute: number; endMinute: number; inboxItemId?: string }) => void;
  onRemoveTask?: (taskId: string) => void;
  onUpdateTask: (taskId: string, startMinute: number, endMinute: number) => void;
  disabled: boolean;
  focusState: "idle" | "running" | "paused" | "break" | "completed";
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
  const [currentMinute, setCurrentMinute] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });
  const currentOffset = minuteToOffset(currentMinute);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const didAutoScrollRef = useRef(false);
  const trashRef = useRef<HTMLDivElement | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (didAutoScrollRef.current) return;
    if (!scrollRef.current) return;
    if (currentMinute < START_HOUR * 60 || currentMinute > END_HOUR * 60) return;
    scrollRef.current.scrollTop = Math.max(currentOffset - 220, 0);
    didAutoScrollRef.current = true;
  }, [currentMinute, currentOffset]);

  function scrollToNow() {
    if (!scrollRef.current) return;
    if (currentMinute < START_HOUR * 60 || currentMinute > END_HOUR * 60) return;
    scrollRef.current.scrollTo({ top: Math.max(currentOffset - 220, 0), behavior: "smooth" });
  }

  function isPointerOverTrash(clientX: number, clientY: number) {
    if (!trashRef.current) return false;
    const rect = trashRef.current.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState) return;

    if (!disabled && onRemoveTask && dragState.mode === "move" && isOverTrash) {
      onRemoveTask(dragState.taskId);
    }

    setDragState(null);
    setIsOverTrash(false);

    try {
      boardRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  function commitDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState || disabled) return;
    event.preventDefault();

    const nextIsOverTrash =
      dragState.mode === "move" && Boolean(onRemoveTask) && isPointerOverTrash(event.clientX, event.clientY);
    if (nextIsOverTrash !== isOverTrash) {
      setIsOverTrash(nextIsOverTrash);
    }

    if (nextIsOverTrash && dragState.mode === "move") {
      return;
    }

    const rawDeltaMinutes = ((event.clientY - dragState.originY) / HOUR_HEIGHT) * 60;
    const minuteDelta = Math.round(rawDeltaMinutes / SNAP_MINUTES) * SNAP_MINUTES;

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

  function getExternalDragPayload(event: React.DragEvent) {
    const raw = event.dataTransfer.getData("application/x-daily-focus-inbox");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { title?: unknown; id?: unknown };
        const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
        const inboxItemId = typeof parsed.id === "string" ? parsed.id : undefined;
        if (title) return { title, inboxItemId };
      } catch {
        // ignore
      }
    }

    const text = event.dataTransfer.getData("text/plain");
    if (typeof text === "string" && text.trim()) return { title: text.trim() };
    return null;
  }

  function onDropIntoBoard(event: React.DragEvent<HTMLDivElement>) {
    if (disabled) return;
    if (!onDropExternalTask) return;

    const payload = getExternalDragPayload(event);
    if (!payload) return;

    event.preventDefault();

    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const yInScroll = event.clientY - rect.top + container.scrollTop;
    const snappedMinute = snapMinute(offsetToMinute(yInScroll));

    const startMinute = clamp(snappedMinute, START_HOUR * 60, END_HOUR * 60 - 30);
    const endMinute = clamp(startMinute + 30, START_HOUR * 60 + 15, MINUTES_IN_DAY);

    onDropExternalTask({ title: payload.title, startMinute, endMinute, inboxItemId: payload.inboxItemId });
  }

  function canAcceptExternalDrop(event: React.DragEvent) {
    const types = Array.from(event.dataTransfer.types ?? []);
    return (
      types.includes("application/x-daily-focus-inbox") ||
      types.includes("text/plain") ||
      types.includes("text") ||
      types.includes("Text")
    );
  }

  return (
    <div
      ref={boardRef}
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px]"
      style={{
        background:
          focusState === "running" || focusState === "paused" || focusState === "break"
            ? "var(--focus-dim-panel)"
            : "var(--panel-soft)",
        border: "1px solid var(--line)",
      }}
      onDragOverCapture={(event) => {
        if (disabled) return;
        if (!onDropExternalTask) return;
        if (!canAcceptExternalDrop(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDropCapture={onDropIntoBoard}
      onPointerMove={disabled ? undefined : commitDrag}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {dragState?.mode === "move" && onRemoveTask ? (
        <div
          ref={trashRef}
          className={cn(
            "pointer-events-none absolute right-4 top-1/2 z-30 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-[20px] transition",
            isOverTrash ? "scale-[1.03]" : "scale-100",
          )}
          style={{
            background: isOverTrash ? "rgba(239, 68, 68, 0.16)" : "var(--panel-strong)",
            border: `1px dashed ${isOverTrash ? "rgba(239, 68, 68, 0.6)" : "var(--line)"}`,
            boxShadow: isOverTrash ? "0 18px 48px rgba(239, 68, 68, 0.18)" : "none",
          }}
          aria-hidden
        >
          <Trash2 className="h-5 w-5" style={{ color: isOverTrash ? "rgb(239, 68, 68)" : "var(--muted)" }} />
        </div>
      ) : null}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-6 py-4 backdrop-blur-md"
        style={{
          background:
            focusState === "running" || focusState === "paused" || focusState === "break"
              ? "var(--focus-dim-panel)"
              : "var(--panel-soft)",
        }}
      >
        <div className="w-16 text-[11px] uppercase tracking-[0.24em] text-muted">TIME</div>
        <div className="flex-1 text-[11px] uppercase tracking-[0.24em] text-muted">Schedule</div>
        <button
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition"
          onClick={scrollToNow}
          style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
          type="button"
        >
          <Clock3 className="h-3.5 w-3.5" />
          Now
        </button>
      </div>

      <div
        className="soft-scrollbar relative min-h-0 flex-1 overflow-y-auto transition duration-300"
        onDragOver={(event) => {
          if (disabled) return;
          if (!onDropExternalTask) return;
          if (!canAcceptExternalDrop(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDropIntoBoard}
        ref={scrollRef}
        style={{
          opacity: focusState === "running" ? 0.64 : focusState === "paused" ? 0.76 : focusState === "break" ? 0.82 : 1,
          filter:
            focusState === "running"
              ? "saturate(0.72)"
              : focusState === "paused"
                ? "saturate(0.8)"
              : focusState === "break"
                ? "saturate(0.86)"
                : "none",
        }}
      >
        <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
          {freeBlocks.map((block) => (
            <button
              key={`${block.startMinute}-${block.endMinute}`}
              className="absolute left-20 right-6 rounded-[20px] text-left transition"
              disabled={disabled}
              onClick={() => onCreateTask(block.startMinute, Math.min(block.startMinute + 60, block.endMinute))}
              style={{
                top: minuteToOffset(block.startMinute),
                height: minuteToOffset(block.endMinute) - minuteToOffset(block.startMinute),
                background: "var(--accent-soft)",
                border: "1px dashed var(--line)",
                opacity: disabled ? 0.5 : 1,
              }}
              type="button"
            >
              <div
                className="absolute right-4 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "var(--panel-strong)", color: "var(--accent)" }}
              >
                空き枠（クリックで作成）
              </div>
            </button>
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
                  className="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    background: "var(--button-primary)",
                    color: "var(--button-primary-text)",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
                  }}
                >
                  Now
                </div>
              </div>
              <div className="mr-6 flex flex-1 items-center">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--button-primary)" }} />
                <div className="h-px flex-1" style={{ background: "var(--accent)" }} />
              </div>
            </div>
          ) : null}

          {tasks.map((task) => {
            const top = minuteToOffset(task.startMinute);
            const rawHeight = minuteToOffset(task.endMinute) - minuteToOffset(task.startMinute);
            const height = Math.max(rawHeight, 56);
            const isTiny = height < 78;
            const isCompact = height < 110;
            const categoryStyle = CATEGORY_STYLES[task.category];

            return (
              <div
                key={task.id}
                className={cn(
                  "group absolute left-24 right-6 overflow-hidden rounded-[20px] text-left transition duration-200",
                  isCompact ? "px-3 py-2.5" : "p-4",
                  dragState?.taskId === task.id && "scale-[1.01]",
                  "select-none",
                  disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                )}
                onClick={() => onSelectTask(task.id)}
                onDoubleClick={() => {
                  if (!disabled) onEditTask(task);
                }}
                onPointerDown={(event) => {
                  if (disabled) return;
                  if (event.button !== 0) return;
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectTask(task.id);
                  setDragState({
                    taskId: task.id,
                    mode: "move",
                    originY: event.clientY,
                    startMinute: task.startMinute,
                    endMinute: task.endMinute,
                  });
                  try {
                    boardRef.current?.setPointerCapture(event.pointerId);
                  } catch {
                    // ignore
                  }
                }}
                onKeyDown={(event) => {
                  if (disabled) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectTask(task.id);
                    return;
                  }
                  if (event.key.toLowerCase() === "e") {
                    event.preventDefault();
                    onEditTask(task);
                  }
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                style={{
                  top,
                  height,
                  background: task.completed ? "rgba(16, 185, 129, 0.12)" : "var(--panel-strong)",
                  border: `1px solid ${selectedTaskId === task.id ? "var(--line-strong)" : "var(--line)"}`,
                  boxShadow: dragState?.taskId === task.id ? "var(--shadow-panel)" : "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", categoryStyle.color)} />
                      <p className="truncate text-sm font-semibold">{task.title}</p>
                      {isTiny ? (
                        <span className="shrink-0 text-[11px] font-medium text-muted">
                          {formatMinute(task.startMinute)} - {formatMinute(task.endMinute)}
                        </span>
                      ) : null}
                    </div>
                    {!isTiny ? (
                      <p className={cn("text-xs font-medium text-muted", isCompact ? "mt-1" : "mt-2")}>
                        {formatMinute(task.startMinute)} - {formatMinute(task.endMinute)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Edit task"
                      className={cn(
                        "rounded-full transition",
                        disabled && "pointer-events-none",
                        "opacity-0 group-hover:opacity-100",
                        isTiny ? "p-1.5" : "p-2",
                      )}
                      onClick={(event) => {
                        if (disabled) return;
                        event.stopPropagation();
                        onEditTask(task);
                      }}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      style={{ background: "var(--bg-muted)", color: "var(--muted)" }}
                      type="button"
                    >
                      <Pencil className={cn(isTiny ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    </button>
                  </div>
                </div>

                {!isCompact ? (
                  <>
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
                  </>
                ) : null}

                <button
                  className="absolute inset-x-6 bottom-2 h-1.5 cursor-ns-resize rounded-full"
                  disabled={disabled}
                  onPointerDown={(event) => {
                    if (disabled) return;
                    event.stopPropagation();
                    event.preventDefault();
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
