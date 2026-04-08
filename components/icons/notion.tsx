"use client";

export function NotionIcon({
  className,
  title = "Notion",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 256 256"
    >
      <title>{title}</title>
      <rect x="16" y="16" width="224" height="224" rx="32" fill="#111111" />
      <path
        d="M92 70c6 0 10 2 14 6l62 76V78c0-5 4-8 9-8h8c5 0 9 3 9 8v108c0 8-6 14-14 14-6 0-10-2-14-6l-62-76v76c0 5-4 8-9 8h-8c-5 0-9-3-9-8V84c0-8 6-14 14-14z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

