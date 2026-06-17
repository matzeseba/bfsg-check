import { BoltIcon, BotIcon, FileCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { HERO } from "@/lib/config";

import { ScanForm } from "./ScanForm";

const ICONS = [BoltIcon, BotIcon, FileCheckIcon] as const;

export function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-12 text-center sm:pt-28 sm:pb-16">
        <Badge variant="outline" className="mb-6">
          {HERO.pill}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {HERO.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {HERO.subline}
        </p>
        <div className="mt-10 w-full max-w-xl">
          <ScanForm />
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {HERO.badges.map((badge, i) => {
            const Icon = ICONS[i] ?? BoltIcon;
            return (
              <li key={badge} className="inline-flex items-center gap-1.5">
                <Icon className="size-4" aria-hidden />
                <span>{badge}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
