"use client";

import * as motion from "motion/react-client";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { HERO } from "@/lib/config";

import { ScanForm } from "./ScanForm";

export function Hero() {
  return (
    <section
      id="scan"
      className="relative isolate overflow-hidden border-b border-border/60"
    >
      {/* Hintergrund-Komposition: Indigo-Wash + Aurora-Blobs + Grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/40"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[120%] grid-bg opacity-[0.45] mask-fade-y"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-[-10%] -z-10 size-[60vw] rounded-full bg-brand-mint/25 blur-3xl animate-aurora"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-15%] right-[-10%] -z-10 size-[55vw] rounded-full bg-brand-indigo/25 blur-3xl animate-aurora [animation-delay:-9s]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Linke Spalte: Hero-Text + Form */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex"
          >
            <a
              href="#pakete"
              className="group/pill inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-card-soft backdrop-blur transition-all hover:border-brand-mint/60 hover:text-foreground"
            >
              <span
                aria-hidden
                className="inline-flex size-1.5 rounded-full bg-brand-mint animate-pulse-soft"
              />
              <span className="font-semibold text-brand-indigo">
                {HERO.pillFlag}
              </span>
              <span>{HERO.pill}</span>
              <ArrowRightIcon className="size-3 -translate-x-0.5 opacity-0 transition-all group-hover/pill:translate-x-0 group-hover/pill:opacity-100" />
            </a>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 text-[clamp(2.5rem,6.4vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance"
          >
            <span className="block gradient-text-soft">
              {HERO.headlineLead}
            </span>
            <span className="block gradient-text">{HERO.headlineEmph}</span>
            <span className="block text-foreground/85 text-[0.74em] font-medium tracking-tight">
              {HERO.headlineTail}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            {HERO.subline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="mt-9 max-w-xl"
          >
            <ScanForm variant="hero" />
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.08, delayChildren: 0.4 },
              },
            }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {HERO.badges.map((badge) => (
              <motion.li
                key={badge}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="inline-flex items-center gap-1.5"
              >
                <CheckCircle2Icon className="size-4 text-brand-mint" aria-hidden />
                <span>{badge}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Mini-Trust-Bar darunter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55 }}
            className="mt-10 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4"
          >
            {HERO.trust.map((item) => (
              <div key={item.label}>
                <p className="font-display text-xl font-bold tracking-tight tabular-nums text-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.sub}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Rechte Spalte: Mock-Result-Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <HeroPreviewCard />
        </motion.div>
      </div>
    </section>
  );
}

// Demo-Vorschau, die im Hero die Wertversprechen visualisiert.
function HeroPreviewCard() {
  const findings = [
    {
      severity: "Kritisch",
      title: "Fehlende Alt-Texte (8 Bilder)",
      tone: "high",
    },
    {
      severity: "Mittel",
      title: "Kontrast < 4.5:1 auf CTA-Buttons",
      tone: "mid",
    },
    {
      severity: "Mittel",
      title: "Formularfeld ohne sichtbares Label",
      tone: "mid",
    },
    {
      severity: "Hinweis",
      title: "Heading-Hierarchie überspringt H3",
      tone: "low",
    },
  ];

  return (
    <div className="group/preview relative">
      <div
        aria-hidden
        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-brand-mint/40 via-brand-indigo/20 to-transparent opacity-60 blur-2xl transition-opacity group-hover/preview:opacity-80"
      />
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-2 shadow-card-hover backdrop-blur-sm">
        {/* Browser-Chrome */}
        <div className="flex items-center gap-2 rounded-t-2xl border-b border-border/60 bg-muted/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-destructive/60" aria-hidden />
          <span
            className="size-2.5 rounded-full bg-brand-amber/70"
            aria-hidden
          />
          <span className="size-2.5 rounded-full bg-brand-mint/80" aria-hidden />
          <div className="mx-auto inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-flex size-1.5 rounded-full bg-brand-mint" />
            <span className="tabular-nums">bfsg-fix.de/report/4f2a</span>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6">
          {/* Score */}
          <div className="flex items-start gap-4">
            <ScoreGauge value={62} />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <SparklesIcon className="size-3.5 text-brand-mint" />
                <span>Live-Auszug aus dem Vollreport</span>
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                62 / 100 · Note C
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mehrere Mängel — erhöhtes Beschwerderisiko. 17 Funde gesamt,
                davon 4 kritisch.
              </p>
            </div>
          </div>

          {/* Findings-Liste */}
          <ul className="grid gap-2.5">
            {findings.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5"
              >
                <span
                  className={
                    f.tone === "high"
                      ? "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-destructive/12 text-destructive"
                      : f.tone === "mid"
                        ? "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber"
                        : "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-mint/15 text-brand-mint"
                  }
                  aria-hidden
                >
                  <ShieldCheckIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.severity}</p>
                </div>
                <ArrowRightIcon className="size-3.5 text-muted-foreground" />
              </motion.li>
            ))}
          </ul>

          {/* CTA-Strip */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-mint/40 bg-brand-mint/10 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Vollreport sichern — Mängel beheben, bevor andere sie finden.
            </p>
            <a
              href="#pakete"
              className="inline-flex items-center gap-1 rounded-lg bg-brand-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Pakete
              <ArrowRightIcon className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - progress / 100);
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          strokeWidth="6"
          className="stroke-muted"
          fill="none"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-brand-mint"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-lg font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}
