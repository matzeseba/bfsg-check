"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/States";

// react-grid-layout benoetigt window -> nur clientseitig rendern.
const DashboardGrid = dynamic(
  () => import("@/components/dashboard/DashboardGrid").then((m) => m.DashboardGrid),
  { ssr: false, loading: () => <Loading label="Lade Dashboard …" /> },
);

export default function DashboardPage() {
  return <DashboardGrid />;
}
