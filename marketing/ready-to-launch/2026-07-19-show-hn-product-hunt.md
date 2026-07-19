# Show HN + Product Hunt Launch (ready to post)

English copy. Honest, founder-disclosed framing (no hype, no compliance claims).
**When:** post Show HN on a weekday morning US time for best reach.

---

## 1) Show HN (news.ycombinator.com)

**Title:**
Show HN: Free WCAG 2.1 AA scanner for German websites (BFSG deadline)

**Body:**

I'm the founder of BFSG-Check (https://bfsg-fix.de). Full disclosure up front: this is my product and there's a paid tier, but the scan I'm asking you to try is free and needs no signup to see results.

Some background on why it exists. Since 28 June 2025, Germany's Barrierefreiheitsstärkungsgesetz (BFSG — the national implementation of the European Accessibility Act) requires many commercial websites and online shops to be accessible, roughly to WCAG 2.1 AA. A lot of small German shop owners (Shopware, JTL, WooCommerce, Shopify) I talked to had heard the acronym, gotten a scary email from someone, and had no idea whether their own site was anywhere close. The existing answers were either a €2,000 manual audit or a wall of raw axe-core JSON they couldn't read.

So I built a scanner. Under the hood it's Playwright driving a headless Chromium over the page, running axe-core for the WCAG rule checks, plus some extra passes for cookie-banner / TDDDG issues that are specific to the German legal context. It spits out the failing criteria grouped by WCAG success criterion, in plain German, with the actual DOM node that's failing.

Honest about the limits: automated tooling catches maybe 30-40% of WCAG issues. It will not tell you your site is "compliant" — no automated tool honestly can, and I deliberately don't use that word anywhere. It finds the mechanical stuff (missing alt text, contrast, form labels, landmark structure, focus order signals) and gives you a prioritized list. Real conformance still needs a human checking keyboard nav, screen-reader flow, and content. I'd rather say that clearly than oversell it.

What I'd genuinely like feedback on:
- Is the free report actually readable for a non-developer, or still too technical?
- The cookie/TDDDG checks are the fuzziest part legally — if you know this area, I'd love a sanity check.
- Anything in the scanning approach (Playwright + axe-core) you'd do differently for reliability across weird CMS markup.

It's a solo project, German market, very early. Paste any URL and you'll get the scan — no account needed to see the on-page results. Happy to answer anything technical in the comments.

---

## 2) Product Hunt Launch (producthunt.com)

**Tagline (≤ 60 chars):**
Free WCAG 2.1 AA scan for German websites

**Description:**

BFSG-Check runs an automated technical analysis of any website against WCAG 2.1 AA — the standard behind Germany's new BFSG accessibility law (in force since June 2025). Paste a URL, get a prioritized list of the accessibility issues a machine can detect: contrast, alt text, form labels, heading and landmark structure, focus order, plus cookie-banner/TDDDG checks specific to the German market.

It's built on Playwright + axe-core, and the free scan needs no signup to show you results. Paid tiers add a full PDF report and a step-by-step fix plan, but the point of launching here is the free check.

Straight talk: automated tools catch roughly a third of real accessibility problems. This won't certify your site or call it "compliant" — it gives you an honest, readable starting point instead of a €2,000 audit invoice or a pile of raw JSON. For a small shop owner who just wants to know "how bad is it and what do I fix first," that's the gap it fills.

Made by one person, for the German SMB web. Feedback very welcome.

**First maker comment:**

Hi Product Hunt — maker here.

I built this after watching small German shop owners panic about BFSG (our version of the European Accessibility Act, mandatory since 28 June 2025) with no affordable way to even find out where they stand. The choices were an expensive manual audit or developer tooling they couldn't read.

So: paste a URL, and a headless browser runs axe-core plus some Germany-specific cookie/TDDDG checks and hands back the failing WCAG criteria in plain language, with the exact element that's broken and what to fix first. No account needed to see the results.

I want to be upfront about what it is and isn't. It's an automated technical analysis — it catches the mechanical ~30-40% of WCAG issues. It is not a compliance certificate, and I intentionally avoid promising "legally safe" or similar, because no scanner can honestly claim that. Real conformance still needs a human testing keyboard and screen-reader flow. I'd rather tell you that than sell you a false sense of safety.

It's a solo project and still early, so I'm genuinely here for feedback:
- Is the report readable if you're not a developer?
- If you know German accessibility/cookie law, does the TDDDG part hold up?
- What would make the free scan actually useful enough to act on?

Try it with any URL and tell me where it falls short. Thanks for taking a look.
