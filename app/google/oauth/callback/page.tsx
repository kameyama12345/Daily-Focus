"use client";

import { useRouter } from "next/navigation";

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <div
        className="rounded-[28px] p-6"
        style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
      >
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Google Calendar</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">連携（準備中）</h1>
        <p className="mt-4 text-sm text-muted">この画面は将来のGoogleカレンダー連携用です（今回はUIのみ）。</p>

        <div className="mt-6 flex gap-2">
          <button
            className="rounded-full px-4 py-2 text-sm"
            onClick={() => router.replace("/")}
            style={{
              background: "var(--button-primary)",
              color: "var(--button-primary-text)",
            }}
            type="button"
          >
            戻る
          </button>
        </div>
      </div>
    </main>
  );
}
