export interface NavItem {
  href: string;
  label: string;
  /** Kurzes Inline-SVG-Icon (aria-hidden). */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/inbox", label: "Posteingang", icon: "inbox" },
  { href: "/library", label: "Bibliothek", icon: "book" },
  { href: "/health", label: "System", icon: "pulse" },
  { href: "/finance", label: "Finanzen", icon: "euro" },
  { href: "/agents", label: "Agenten", icon: "bot" },
];

export function titleForPath(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const item = NAV_ITEMS.find(
    (n) => n.href !== "/" && pathname.startsWith(n.href),
  );
  return item?.label ?? "AOS";
}
