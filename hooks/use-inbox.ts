"use client";

import { useEffect, useMemo, useState } from "react";
import { InboxItem, InboxStatus } from "@/lib/types";
import { loadInboxItems, saveInboxItems } from "@/lib/inbox-storage";

function createInboxId() {
  return `inbox-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

export function useInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadInboxItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveInboxItems(items);
  }, [hydrated, items]);

  const grouped = useMemo(() => {
    const inbox: InboxItem[] = [];
    const today: InboxItem[] = [];
    const done: InboxItem[] = [];

    for (const item of items) {
      if (item.status === "today") today.push(item);
      else if (item.status === "done") done.push(item);
      else inbox.push(item);
    }

    const sortByCreatedDesc = (a: InboxItem, b: InboxItem) => b.createdAt.localeCompare(a.createdAt);
    inbox.sort(sortByCreatedDesc);
    today.sort(sortByCreatedDesc);
    done.sort(sortByCreatedDesc);

    return { inbox, today, done };
  }, [items]);

  function addItem(title: string) {
    const normalized = normalizeTitle(title);
    if (!normalized) return false;

    setItems((current) => [
      {
        id: createInboxId(),
        title: normalized,
        status: "inbox",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    return true;
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function moveToStatus(id: string, status: Exclude<InboxStatus, "done">) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status, previousStatus: undefined } : item)),
    );
  }

  function moveToToday(id: string) {
    moveToStatus(id, "today");
  }

  function moveToInbox(id: string) {
    moveToStatus(id, "inbox");
  }

  function toggleDone(id: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "done") {
          const nextStatus = item.previousStatus ?? "inbox";
          return { ...item, status: nextStatus, previousStatus: undefined };
        }
        const previousStatus: Exclude<InboxStatus, "done"> = item.status === "today" ? "today" : "inbox";
        return { ...item, status: "done", previousStatus };
      }),
    );
  }

  return {
    items,
    grouped,
    addItem,
    deleteItem,
    toggleDone,
    moveToToday,
    moveToInbox,
  };
}

export type InboxController = ReturnType<typeof useInbox>;
