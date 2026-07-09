import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: `"sidebar topbar" "sidebar main"`,
        minHeight: "100vh",
      }}
    >
      <Sidebar />
      <Topbar />
      <main
        style={{
          gridArea: "main",
          padding: 24,
          maxWidth: 1400,
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
