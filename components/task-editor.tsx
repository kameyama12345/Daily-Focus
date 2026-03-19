"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import { formatMinute } from "@/lib/time";
import { Task } from "@/lib/types";

function toInputValue(minute: number) {
  return formatMinute(minute);
}

function toMinute(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function TaskEditor({
  open,
  suggestedTask,
  onClose,
  onSave,
}: {
  open: boolean;
  suggestedTask: Task | null;
  onClose: () => void;
  onSave: (task: Partial<Task> & Pick<Task, "title">) => void;
}) {
  const defaults = useMemo(
    () => ({
      id: suggestedTask?.id,
      title: suggestedTask?.title ?? "",
      startMinute: suggestedTask?.startMinute ?? 9 * 60,
      endMinute: suggestedTask?.endMinute ?? 10 * 60,
      category: suggestedTask?.category ?? CATEGORY_OPTIONS[0],
      priority: suggestedTask?.priority ?? PRIORITY_OPTIONS[1],
      memo: suggestedTask?.memo ?? "",
      completed: suggestedTask?.completed ?? false,
    }),
    [suggestedTask],
  );

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: "rgba(6, 10, 17, 0.32)" }}>
      <div
        className="w-full max-w-2xl rounded-[28px] p-6 shadow-float"
        style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Task Editor</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              {suggestedTask ? "タスクを編集" : "タスクを追加"}
            </h3>
          </div>
          <button
            className="rounded-full px-3 py-1.5 text-sm"
            onClick={onClose}
            style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
            type="button"
          >
            閉じる
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-muted-strong">タイトル</span>
            <input
              className="w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="例: Investor update prep"
              style={{ background: "var(--bg-muted)" }}
              value={form.title}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-muted-strong">開始時刻</span>
            <input
              className="w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) =>
                setForm((current) => ({ ...current, startMinute: toMinute(event.target.value) }))
              }
              style={{ background: "var(--bg-muted)" }}
              type="time"
              value={toInputValue(form.startMinute)}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-muted-strong">終了時刻</span>
            <input
              className="w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) =>
                setForm((current) => ({ ...current, endMinute: toMinute(event.target.value) }))
              }
              style={{ background: "var(--bg-muted)" }}
              type="time"
              value={toInputValue(form.endMinute)}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-muted-strong">カテゴリ</span>
            <select
              className="w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as Task["category"],
                }))
              }
              style={{ background: "var(--bg-muted)" }}
              value={form.category}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-muted-strong">優先度</span>
            <select
              className="w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value as Task["priority"],
                }))
              }
              style={{ background: "var(--bg-muted)" }}
              value={form.priority}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-muted-strong">メモ</span>
            <textarea
              className="min-h-28 w-full rounded-[18px] border-0 px-4 py-3 outline-none transition"
              onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
              placeholder="背景、意図、準備物など"
              style={{ background: "var(--bg-muted)" }}
              value={form.memo}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              checked={form.completed}
              onChange={(event) =>
                setForm((current) => ({ ...current, completed: event.target.checked }))
              }
              type="checkbox"
            />
            完了済みにする
          </label>
          <div className="flex gap-2">
            <button
              className="rounded-full px-4 py-2 text-sm"
              onClick={onClose}
              style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
              type="button"
            >
              キャンセル
            </button>
            <button
              className="rounded-full px-5 py-2 text-sm font-medium text-white"
              onClick={() => {
                if (!form.title.trim()) return;
                onSave({ ...form, title: form.title.trim() });
                onClose();
              }}
              style={{ background: "var(--text)" }}
              type="button"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
