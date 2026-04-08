"use client";

import { X } from "lucide-react";
import { SchedulePreset } from "@/lib/types";

function PresetCard({
  preset,
  onClick,
}: {
  preset: SchedulePreset;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-[22px] p-5 text-left transition"
      onClick={onClick}
      style={{
        background: "var(--panel-strong)",
        border: "1px solid var(--line)",
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold tracking-tight">{preset.title}</div>
          <div className="mt-1 text-xs text-muted">クリックで今日に反映</div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-medium"
          style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
        >
          {preset.items.length}件
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {preset.items.slice(0, 4).map((item) => (
          <div
            key={`${preset.id}-${item.start}-${item.title}`}
            className="flex items-center justify-between rounded-[16px] px-4 py-2 text-sm"
            style={{ background: "var(--bg-muted)", border: "1px solid var(--line)" }}
          >
            <div className="truncate font-medium">{item.title}</div>
            <div className="ml-3 shrink-0 text-xs text-muted">
              {item.start}–{item.end}
            </div>
          </div>
        ))}
        {preset.items.length > 4 ? (
          <div className="text-xs text-muted">ほか {preset.items.length - 4} 件</div>
        ) : null}
      </div>
    </button>
  );
}

export function SchedulePresetModal({
  open,
  title,
  presets,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  presets: SchedulePreset[];
  onClose: () => void;
  onSelect: (preset: SchedulePreset) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(6, 10, 17, 0.32)" }}
    >
      <div
        className="w-full max-w-3xl rounded-[28px] p-6 shadow-float"
        style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Schedule</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted">迷ったら、まずは1つ選んで今日を組み立てましょう。</p>
          </div>

          <button
            aria-label="Close"
            className="rounded-full p-2 transition"
            onClick={onClose}
            style={{ background: "var(--bg-muted)", color: "var(--muted-strong)" }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {presets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} onClick={() => onSelect(preset)} />
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full px-4 py-2 text-sm"
            onClick={onClose}
            style={{
              background: "var(--button-secondary)",
              color: "var(--button-secondary-text)",
            }}
            type="button"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

