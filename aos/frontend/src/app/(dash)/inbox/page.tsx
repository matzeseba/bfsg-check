"use client";

import { Suspense } from "react";
import { InboxView } from "@/components/inbox/InboxView";
import { Loading } from "@/components/ui/States";

export default function InboxPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InboxView />
    </Suspense>
  );
}
