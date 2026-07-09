/** Kompakte, abhaengigkeitsfreie Inline-SVG-Icons (stroke = currentColor). */

const PATHS: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  inbox: "M4 13h4l2 3h4l2-3h4M4 4h16v16H4z",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 19H6",
  pulse: "M3 12h4l3 8 4-16 3 8h4",
  euro: "M17 6a6 6 0 1 0 0 12M4 10h9M4 14h9",
  bot: "M12 2v3M8 8h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3zM9 14h.01M15 14h.01",
  bell: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
  logout: "M15 12H4m0 0l4-4m-4 4l4 4M13 4h6v16h-6",
  close: "M6 6l12 12M18 6L6 18",
  reset: "M4 4v6h6M4 10a8 8 0 1 1-2 5",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  plus: "M12 5v14M5 12h14",
  copy: "M9 9h11v11H9zM4 4h11v3M4 4v11h3",
  play: "M6 4l14 8-14 8z",
  check: "M4 12l5 5 11-11",
  x: "M6 6l12 12M18 6L6 18",
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
}) {
  const d = PATHS[name] ?? PATHS.grid;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
