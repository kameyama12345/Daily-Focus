"use client";

export function GoogleIcon({
  className,
  title = "Google",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 48 48"
    >
      <title>{title}</title>
      <path
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37.5 24 37.5c-7.5 0-13.5-6-13.5-13.5S16.5 10.5 24 10.5c3.3 0 6.3 1.2 8.7 3.2l6-6C35.1 4.4 29.8 2 24 2 12.4 2 3 11.4 3 23s9.4 21 21 21 20.5-9 20.5-21c0-1.4-.2-2.7-.5-3z"
        fill="#FFC107"
      />
      <path
        d="M6.3 14.7l7 5.1C15.2 16 19.2 13 24 13c3.3 0 6.3 1.2 8.7 3.2l6-6C35.1 6.4 29.8 4 24 4 15.9 4 8.9 8.5 6.3 14.7z"
        fill="#FF3D00"
      />
      <path
        d="M24 44c5.7 0 10.9-2.2 14.8-5.9l-6.8-5.6c-2 1.4-4.6 2.2-8 2.2-6 0-11.1-4-12.9-9.5l-7.1 5.5C6.8 38.2 14.9 44 24 44z"
        fill="#4CAF50"
      />
      <path
        d="M44.5 20H24v8.5h11.8c-1.1 3.1-3.3 5.3-6.1 6.6l.1.1 6.8 5.6c-.5.5 8.2-6 8.2-17.8 0-1.4-.2-2.7-.5-3z"
        fill="#1976D2"
      />
    </svg>
  );
}

