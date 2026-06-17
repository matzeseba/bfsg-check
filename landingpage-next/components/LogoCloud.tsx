import { LOGO_CLOUD } from "@/lib/config";

export function LogoCloud() {
  return (
    <section
      aria-labelledby="logocloud-heading"
      className="border-y border-border/50 bg-card/40"
    >
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <p
          id="logocloud-heading"
          className="text-center font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
        >
          {LOGO_CLOUD.kicker}
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 grayscale">
          {LOGO_CLOUD.logos.map((logo) => (
            <li
              key={logo.name}
              className="font-display text-base font-semibold tracking-tight text-foreground/80 transition-colors hover:text-foreground sm:text-lg"
              style={{ minWidth: logo.width }}
            >
              {logo.name}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Platzhalter — echte Mentions folgen nach Launch-PR.
        </p>
      </div>
    </section>
  );
}
