// Deutsche Voice-/Text-Intents → Action-Mapping. Erweiterbar durch den Voice-Agenten.
// matchIntent(text) -> { actionId, args, needsConfirmation } | null
import { getAction } from '../actions/registry.js';

const RULES = [
  { re: /tagescheck|wie steht'?s|status heute/i, actionId: 'A01' },
  { re: /wochenreport|kpis?|wie laufen die verk[äa]ufe|wochen[üu]berblick/i, actionId: 'A02' },
  { re: /smoke[\s-]?check|ist die (site|seite) ok|funnel.*ok/i, actionId: 'A03' },
  { re: /(ad|anzeigen)[\s-]?varianten|neue headlines|rsa[\s-]?headlines/i, actionId: 'A04', topic: true },
  { re: /(neue )?(werbe)?kampagne.*(erstell|bau|start)|google[\s-]?ads[\s-]?sprint/i, actionId: 'A05', topic: true },
  { re: /search[\s-]?terms?|geld verbrenn|negativ[\s-]?keywords/i, actionId: 'A06' },
  { re: /(seo[\s-]?)?artikel schreib|blog[\s-]?(post|artikel)/i, actionId: 'A07', topic: true },
  { re: /wochen[\s-]?content|content (für|fuer) diese woche/i, actionId: 'A08' },
  { re: /pressemitteilung|listing|pm (schreib|verfass)/i, actionId: 'A09', topic: true },
  { re: /refund|erstatt|r[üu]ckerstatt/i, actionId: 'A10', needsConfirmation: true },
  { re: /up[\s-]?sell/i, actionId: 'A11' },
  { re: /a\/?b[\s-]?test/i, actionId: 'A12' },
  { re: /incident|site ist down|notfall|500[\s-]?fehler/i, actionId: 'A13', needsConfirmation: true },
  { re: /code[\s-]?review|pr (review|pr[üu]f)|code[\s-]?check/i, actionId: 'A14' },
  { re: /a11y|barrierefrei|accessibility/i, actionId: 'A15' },
  { re: /legal[\s-]?(check|copy|grep)|compliance[\s-]?scan/i, actionId: 'A16' },
  { re: /finance|umsatz diesen monat|wie viel.*verdient|finanz/i, actionId: 'A17' },
  { re: /backup/i, actionId: 'A18', needsConfirmation: true },
];

export function matchIntent(text = '') {
  const t = text.trim();
  for (const rule of RULES) {
    if (rule.re.test(t)) {
      const def = getAction(rule.actionId);
      const args = {};
      if (rule.topic) {
        // Thema heuristisch nach Schlüsselwörtern extrahieren ("für ...", "über ...")
        const m = t.match(/(?:für|fuer|über|ueber|zu|about)\s+(.+)$/i);
        if (m) args.topic = m[1].replace(/\b(erstellen|schreiben|bauen)\b/gi, '').trim();
      }
      return {
        actionId: rule.actionId,
        label: def?.label,
        args,
        needsConfirmation: rule.needsConfirmation || def?.category === 'live' || false,
      };
    }
  }
  return null;
}
