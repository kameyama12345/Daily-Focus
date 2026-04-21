import { InboxItem, InboxStatus } from "@/lib/types";

export const INBOX_STORAGE_KEY = "daily-focus-inbox";

function isInboxStatus(value: unknown): value is InboxStatus {
  return value === "inbox" || value === "today" || value === "done";
}

function isInboxItem(value: unknown): value is InboxItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<InboxItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.createdAt === "string" &&
    isInboxStatus(item.status)
  );
}

export function loadInboxItems(): InboxItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(INBOX_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isInboxItem);
  } catch {
    return [];
  }
}

export function saveInboxItems(items: InboxItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

