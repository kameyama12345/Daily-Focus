"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

type FieldValues = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FieldValues, string>>;

export function AuthScreen({ mode }: AuthScreenProps) {
  const isLogin = mode === "login";
  const [values, setValues] = useState<FieldValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const title = isLogin ? "サインイン" : "サインアップ";
  const eyebrow = isLogin ? "LOGIN" : "SIGN UP";
  const primaryAction = isLogin ? "サインイン" : "サインアップ";
  const headerPrompt = isLogin
    ? "アカウントをお持ちでないですか？"
    : "既にアカウントをお持ちですか？";
  const switchLabel = isLogin ? "サインアップ" : "サインイン";
  const switchHref = isLogin ? "/signup" : "/login";
  const panelDescription = isLogin
    ? "登録済みのメールアドレスとパスワードで DAILY FOCUS にサインインする画面です。"
    : "新しくアカウントを作成して DAILY FOCUS を使い始めるための登録画面です。";

  const helperText = {
    email: isLogin
      ? "登録時に使用したメールアドレスを入力してください。"
      : "ログインIDとして利用するメールアドレスを入力してください。",
    password: isLogin
      ? "半角英数字を含むパスワードを入力します。"
      : "6〜64文字で設定します。英字と数字を組み合わせると安全です。",
  };

  const validate = (currentValues: FieldValues) => {
    const nextErrors: FieldErrors = {};

    if (!currentValues.email.trim()) {
      nextErrors.email = "メールアドレスは必須です。";
    }

    if (!currentValues.password.trim()) {
      nextErrors.password = "パスワードは必須です。";
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setErrors(validate(values));
  };

  const handleChange = (field: keyof FieldValues, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (submitted) {
      setErrors(validate(nextValues));
    }
  };

  const renderField = (
    field: keyof FieldValues,
    label: string,
    type: "email" | "password",
    placeholder: string,
  ) => {
    const error = errors[field];
    const helperId = `${field}-helper`;
    const errorId = `${field}-error`;

    return (
      <label className="grid gap-2">
        <span className="flex items-center gap-2 text-[15px] font-medium text-slate-700">
          {label}
          <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-rose-600">
            必須
          </span>
        </span>
        <input
          type={type}
          value={values[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          placeholder={placeholder}
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${helperId} ${errorId}` : helperId}
          className={`h-[52px] rounded-[12px] border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
        <p id={helperId} className="text-[13px] leading-6 text-slate-500">
          {helperText[field]}
        </p>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700"
          >
            {error}
          </p>
        ) : null}
      </label>
    );
  };

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 26%), radial-gradient(circle at bottom right, rgba(17, 24, 39, 0.08), transparent 28%), #f9fafb",
      }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pb-2 pt-7 sm:px-6 lg:px-8">
        <Link href="/" className="text-[32px] font-extrabold tracking-[0.01em] text-slate-900">
          DAILY FOCUS
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-[15px] text-slate-500 sm:inline">{headerPrompt}</span>
          <Link
            href={switchHref}
            className="inline-flex min-h-[42px] items-center justify-center rounded-[14px] bg-slate-900 px-[18px] text-[14px] font-bold text-white transition hover:bg-slate-800"
          >
            {switchLabel}
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="w-full max-w-[470px] rounded-[24px] border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur-[14px]">
          <div className="px-10 pb-8 pt-10 max-sm:px-5 max-sm:pb-6 max-sm:pt-7">
            <p className="mb-2 text-[13px] font-medium tracking-[0.18em] text-slate-400">{eyebrow}</p>
            <h1 className="text-[40px] font-extrabold leading-[1.2] tracking-tight text-slate-900 max-sm:text-[32px]">
              {title}
            </h1>
            <p className="mt-3 text-[14px] leading-7 text-slate-500">{panelDescription}</p>

            <div className="mt-5 rounded-[16px] border border-blue-100 bg-blue-50/70 px-4 py-3">
              <p className="text-[13px] font-semibold text-blue-900">入力ガイド</p>
              <p className="mt-1 text-[13px] leading-6 text-blue-800">
                必須項目を入力せずに送信すると、各入力欄の下にエラーが表示されます。
              </p>
            </div>

            <form className="mt-6 grid gap-4" noValidate onSubmit={handleSubmit}>
              {renderField("email", "メールアドレス", "email", "name@example.com")}
              {renderField(
                "password",
                "パスワード",
                "password",
                isLogin ? "パスワードを入力" : "6〜64文字で入力",
              )}

              <button
                type="submit"
                className="mt-1 inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-base font-bold text-white transition hover:-translate-y-px hover:from-blue-700 hover:to-blue-600"
              >
                {primaryAction}
              </button>
            </form>

            {isLogin ? (
              <Link href="#" className="mt-4 inline-block text-[15px] text-blue-600 hover:text-blue-700">
                パスワードをお忘れですか？
              </Link>
            ) : (
              <p className="mt-4 text-[14px] leading-7 text-slate-500">
                登録することで、利用規約およびプライバシーポリシーに同意したことになります。
              </p>
            )}

            <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="h-px bg-slate-200" />
              <p className="text-[14px] text-slate-400">または</p>
              <span className="h-px bg-slate-200" />
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-slate-200 bg-white px-5 text-base font-medium text-slate-800 transition hover:-translate-y-px hover:bg-slate-50"
              >
                Google で続ける
              </button>
              <button
                type="button"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-slate-200 bg-white px-5 text-base font-medium text-slate-800 transition hover:-translate-y-px hover:bg-slate-50"
              >
                Apple で続ける
              </button>
            </div>

            <p className="mt-6 text-center text-[15px] text-slate-500">
              {headerPrompt}{" "}
              <Link href={switchHref} className="font-medium text-blue-600 hover:text-blue-700">
                {switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
