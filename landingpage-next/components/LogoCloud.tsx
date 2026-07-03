import { ShieldCheckIcon } from "lucide-react";

import { LOGO_CLOUD } from "@/lib/config";

import { Reveal } from "./fx/Reveal";
import { SectionKicker } from "./SectionKicker";

// Trust-Band direkt unter dem Hero: die anerkannten Normen, gegen die wir
// prüfen. Bewusst KEINE erfundenen Presse-Logos (UWG §5a/§5) — nur belegbare,
// wahre Standards als Glow-Border-Pills (Dark-Glow-Signatur). Bewusst als
// schmales "Band" (kein voller py-20-Sektionsabstand).
export function LogoCloud() {
  return (
    <section
      aria-label={LOGO_CLOUD.kicker}
      className="border-y border-border/60 bg-card/30"
    >
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <Reveal variant="up">
          <div className="flex justify-center">
            <SectionKicker icon={ShieldCheckIcon} label={LOGO_CLOUD.kicker} />
          </div>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {LOGO_CLOUD.logos.map((norm) => (
              <li key={norm.name}>
                <span className="glow-border inline-flex items-center rounded-full bg-card/70 px-4 py-1.5 font-display text-sm font-semibold tracking-tight text-foreground/85 backdrop-blur transition-colors hover:text-foreground">
                  {norm.name}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
