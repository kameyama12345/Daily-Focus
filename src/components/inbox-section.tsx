"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { InboxItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { InboxController } from "@/hooks/use-inbox";

function formatCreatedAt(iso: string) {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(date);
  } catch {
    return "";
  }
}

function InboxItemRow({
  item,
  onToggleDone,
  onDelete,
}: {
  item: InboxItem;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  const createdLabel = useMemo(() => formatCreatedAt(item.createdAt), [item.createdAt]);
  const isDone = item.status === "done";

  return (
    <div
      className="rounded-[18px] px-4 py-3"
      style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-start gap-2">
        <button
          aria-label="削除"
          className="grid h-7 w-7 place-items-center rounded-full transition"
          onClick={onDelete}
          style={{
            background: "var(--bg-muted)",
            color: "var(--muted-strong)",
            border: "1px solid var(--line)",
          }}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          aria-label="完了"
          className="grid h-7 w-7 place-items-center rounded-full transition"
          onClick={onToggleDone}
          style={{
            background: "var(--bg-muted)",
            color: isDone ? "var(--accent)" : "var(--muted)",
            border: "1px solid var(--line)",
          }}
          type="button"
        >
          <Check className="h-4 w-4" />
        </button>

        <div
          className="min-w-0 flex-1 cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(
              "application/x-daily-focus-inbox",
              JSON.stringify({ id: item.id, title: item.title }),
            );
            event.dataTransfer.setData("text/plain", item.title);
            event.dataTransfer.setData("text", item.title);
            event.dataTransfer.setData("Text", item.title);
            event.dataTransfer.effectAllowed = "copy";
          }}
          title="ドラッグしてスケジュールへ追加"
        >
          <div
            className={cn("text-sm font-medium", isDone && "line-through")}
            style={{ color: isDone ? "var(--muted)" : "var(--text)" }}
          >
            {item.title}
          </div>
          {createdLabel ? <div className="mt-1 text-xs text-muted">{createdLabel}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function InboxSection({
  inbox,
}: {
  inbox: InboxController;
}) {
  const [draft, setDraft] = useState("");

  const hasAny = inbox.items.length > 0;
  const activeItems = useMemo(
    () => inbox.items.filter((item) => item.status !== "done"),
    [inbox.items],
  );

  function submit() {
    const ok = inbox.addItem(draft);
    if (!ok) return;
    setDraft("");
  }

  return (
    <section className="surface rounded-[24px] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted">INBOX</div>
          <div className="mt-2 text-lg font-semibold">タスクをすぐメモ</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="w-full rounded-full border-0 px-4 py-3 text-sm outline-none transition"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            submit();
          }}
          placeholder="思いついたことを1行で"
          style={{ background: "var(--bg-muted)" }}
          value={draft}
        />
        <button
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition"
          onClick={submit}
          style={{ background: "var(--button-primary)", color: "var(--button-primary-text)" }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          追加
        </button>
      </div>

      {!hasAny ? (
        <div className="mt-4 rounded-[18px] px-4 py-4 text-sm text-muted" style={{ background: "var(--bg-muted)" }}>
          <div>まだINBOXは空です。</div>
          <div className="mt-1">思いついたことをすぐ追加しましょう。</div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">INBOX</div>
            <div className="mt-3 space-y-2">
              {activeItems.length === 0 ? (
                <div className="rounded-[18px] px-4 py-3 text-sm text-muted" style={{ background: "var(--bg-muted)" }}>
                  INBOXは空です。
                </div>
              ) : (
                activeItems.map((item) => (
                  <InboxItemRow
                    key={item.id}
                    item={item}
                    onDelete={() => inbox.deleteItem(item.id)}
                    onToggleDone={() => inbox.toggleDone(item.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">完了</div>
            <div className="mt-3 space-y-2">
              {inbox.grouped.done.length === 0 ? (
                <div className="rounded-[18px] px-4 py-3 text-sm text-muted" style={{ background: "var(--bg-muted)" }}>
                  まだありません。
                </div>
              ) : (
                inbox.grouped.done.map((item) => (
                  <InboxItemRow
                    key={item.id}
                    item={item}
                    onDelete={() => inbox.deleteItem(item.id)}
                    onToggleDone={() => inbox.toggleDone(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
