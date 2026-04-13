"use client";

import { Plus, Sparkles, LayoutTemplate } from "lucide-react";

export function HeaderActions({
  disabled,
  onOpenRecommended,
  onOpenTemplate,
  onNewTask,
}: {
  disabled: boolean;
  onOpenRecommended: () => void;
  onOpenTemplate: () => void;
  onNewTask: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="rounded-full px-4 py-2.5 text-sm transition"
        disabled={disabled}
        onClick={onOpenRecommended}
        style={{
          background: "var(--button-secondary)",
          color: "var(--button-secondary-text)",
          opacity: disabled ? 0.65 : 1,
        }}
        type="button"
      >
        <Sparkles className="mr-1 inline h-4 w-4" />
        おすすめスケジュール
      </button>

      <button
        className="rounded-full px-4 py-2.5 text-sm transition"
        disabled={disabled}
        onClick={onOpenTemplate}
        style={{
          background: "var(--button-secondary)",
          color: "var(--button-secondary-text)",
          opacity: disabled ? 0.65 : 1,
        }}
        type="button"
      >
        <LayoutTemplate className="mr-1 inline h-4 w-4" />
        テンプレート
      </button>

      <button
        className="rounded-full px-4 py-2.5 text-sm font-medium transition"
        disabled={disabled}
        onClick={onNewTask}
        style={{
          background: "var(--button-primary)",
          color: "var(--button-primary-text)",
          opacity: disabled ? 0.65 : 1,
        }}
        type="button"
      >
        <Plus className="mr-1 inline h-4 w-4" />
        新規タスク
      </button>
    </div>
  );
}
