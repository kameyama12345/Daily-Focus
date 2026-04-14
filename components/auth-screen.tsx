import Link from "next/link";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const isLogin = mode === "login";

  const title = isLogin ? "サインイン" : "サインアップ";
  const eyebrow = isLogin ? "LOGIN" : "SIGN UP";
  const primaryAction = isLogin ? "サインイン" : "サインアップ";
  const headerPrompt = isLogin
    ? "アカウントをお持ちでないですか？"
    : "既にアカウントをお持ちですか？";
  const headerLinkLabel = isLogin ? "サインアップ" : "サインイン";
  const headerLinkHref = isLogin ? "/signup" : "/login";
  const footerPrompt = isLogin
    ? "アカウントをお持ちでないですか？"
    : "既にアカウントをお持ちですか？";
  const footerLinkLabel = isLogin ? "サインアップ" : "サインイン";
  const note = isLogin
    ? "アカウント情報を入力して DAILY FOCUS を始めましょう。"
    : "登録することで、利用規約およびプライバシーポリシーに同意したことになります。";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(17,24,39,0.08),transparent_28%),#f9fafb] text-slate-800">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pb-2 pt-6 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-slate-900">
          DAILY FOCUS
        </Link>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="hidden sm:inline">{headerPrompt}</span>
          <Link
            href={headerLinkHref}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {headerLinkLabel}
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-[430px] rounded-[28px] border border-slate-200/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {eyebrow}
          </p>
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>

          <form className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">メールアドレス</span>
              <input
                type="email"
                placeholder="name@example.com"
                className="h-13 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">パスワード</span>
              <input
                type="password"
                placeholder={isLogin ? "パスワードを入力" : "6〜64文字で入力"}
                className="h-13 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex h-13 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-base font-bold text-white transition hover:from-blue-700 hover:to-blue-600"
            >
              {primaryAction}
            </button>
          </form>

          {isLogin ? (
            <Link href="#" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
              パスワードをお忘れですか？
            </Link>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-500">{note}</p>
          )}

          {isLogin && <p className="mt-4 text-sm leading-7 text-slate-500">{note}</p>}

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="h-px bg-slate-200" />
            <p className="text-sm text-slate-400">または</p>
            <span className="h-px bg-slate-200" />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-800 transition hover:bg-slate-50"
            >
              Google で続ける
            </button>
            <button
              type="button"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-800 transition hover:bg-slate-50"
            >
              Apple で続ける
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {footerPrompt}{" "}
            <Link href={headerLinkHref} className="font-medium text-blue-600 hover:text-blue-700">
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
