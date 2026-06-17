// Deutsche Klartext-Übersetzung der häufigsten axe-core-Regeln.
// Pro Regel: title (verständlicher Name), why (Geschäftsrisiko/BFSG-Bezug),
// fix (konkrete Lösung). Unbekannte Regeln fallen auf axe-Hilfetext zurück.

export const RULES_DE = {
  'image-alt': {
    title: 'Bilder ohne Alternativtext',
    why: 'Screenreader können den Bildinhalt nicht vorlesen. Klarer WCAG-1.1.1-Verstoß (Stufe A) — einer der häufigsten Abmahn-Gründe.',
    fix: 'Jedem informativen <img> ein aussagekräftiges alt-Attribut geben. Rein dekorative Bilder erhalten alt="".'
  },
  'input-image-alt': {
    title: 'Bild-Buttons ohne Alternativtext',
    why: 'Als Button genutzte Bilder (z. B. Suche-Lupe) sind für Screenreader-Nutzer nicht bedienbar.',
    fix: '<input type="image"> ein alt-Attribut geben, das die Aktion beschreibt (z. B. alt="Suchen").'
  },
  'area-alt': {
    title: 'Image-Map-Bereiche ohne Alternativtext',
    why: 'Verlinkte Bereiche einer Image-Map sind ohne Text nicht zugänglich.',
    fix: 'Jedem <area> ein beschreibendes alt-Attribut geben.'
  },
  'role-img-alt': {
    title: 'Grafik-Elemente ohne Textalternative',
    why: 'Elemente mit role="img" brauchen einen zugänglichen Namen, sonst fehlt der Inhalt für Screenreader.',
    fix: 'aria-label oder aria-labelledby ergänzen.'
  },
  'svg-img-alt': {
    title: 'SVG-Grafiken ohne Textalternative',
    why: 'Informative SVGs ohne Beschriftung sind für assistive Technik unsichtbar.',
    fix: '<title>-Element im SVG oder aria-label am SVG ergänzen.'
  },
  'object-alt': {
    title: 'Eingebettete Objekte ohne Textalternative',
    why: '<object>-Inhalte (PDFs, Flash-Reste, Embeds) sind ohne Alternativtext nicht zugänglich.',
    fix: 'Alternativtext innerhalb des <object> oder via aria-label bereitstellen.'
  },
  'color-contrast': {
    title: 'Zu geringer Farbkontrast',
    why: 'Text mit zu wenig Kontrast ist für Menschen mit Sehschwäche unlesbar. WCAG 1.4.3 (AA) — sehr häufig und leicht messbar, daher beliebtes Abmahn-Ziel.',
    fix: 'Kontrast auf mindestens 4,5:1 (normaler Text) bzw. 3:1 (großer Text) anheben. Text- oder Hintergrundfarbe anpassen.'
  },
  'link-name': {
    title: 'Links ohne erkennbaren Text',
    why: 'Links wie "hier klicken" oder leere Icon-Links liefern Screenreadern kein Ziel. WCAG 2.4.4.',
    fix: 'Sprechenden Linktext verwenden oder bei Icon-Links aria-label setzen.'
  },
  'button-name': {
    title: 'Schaltflächen ohne Beschriftung',
    why: 'Buttons ohne Text/Label können per Tastatur/Screenreader nicht sinnvoll bedient werden. WCAG 4.1.2.',
    fix: 'Sichtbaren Button-Text oder aria-label ergänzen.'
  },
  'input-button-name': {
    title: 'Eingabe-Buttons ohne Beschriftung',
    why: 'Submit-/Reset-Buttons ohne value/Label sind nicht eindeutig bedienbar.',
    fix: 'value-Attribut oder aria-label setzen.'
  },
  'label': {
    title: 'Formularfelder ohne Beschriftung',
    why: 'Eingabefelder ohne verknüpftes <label> sind für Screenreader unklar — kritisch bei Kontakt-/Bestellformularen. WCAG 1.3.1/4.1.2.',
    fix: '<label for="id"> mit dem Feld verknüpfen oder aria-label verwenden.'
  },
  'select-name': {
    title: 'Auswahlfelder ohne Beschriftung',
    why: '<select>-Dropdowns ohne Label sind nicht eindeutig zuordenbar.',
    fix: 'Mit <label> verknüpfen oder aria-label ergänzen.'
  },
  'form-field-multiple-labels': {
    title: 'Formularfeld mit mehreren Labels',
    why: 'Mehrere Labels pro Feld führen zu widersprüchlicher Ansage im Screenreader.',
    fix: 'Pro Feld genau ein Label verwenden.'
  },
  'html-has-lang': {
    title: 'Fehlende Sprachangabe der Seite',
    why: 'Ohne lang-Attribut spricht der Screenreader Inhalte in falscher Sprache aus. WCAG 3.1.1.',
    fix: '<html lang="de"> setzen.'
  },
  'html-lang-valid': {
    title: 'Ungültige Sprachangabe',
    why: 'Ein ungültiger Sprachcode verhindert korrekte Aussprache.',
    fix: 'Gültigen Code verwenden, z. B. lang="de".'
  },
  'document-title': {
    title: 'Fehlender Seitentitel',
    why: 'Ohne <title> fehlt die Orientierung in Tabs und für Screenreader. WCAG 2.4.2.',
    fix: 'Aussagekräftigen, eindeutigen <title> je Seite vergeben.'
  },
  'meta-viewport': {
    title: 'Zoom unterdrückt (Viewport)',
    why: 'user-scalable=no verhindert Vergrößern — Barriere für Menschen mit Sehschwäche. WCAG 1.4.4.',
    fix: 'maximum-scale/user-scalable-Sperre aus dem viewport-Meta-Tag entfernen.'
  },
  'frame-title': {
    title: 'iFrames ohne Titel',
    why: 'Eingebettete Frames (Karten, Videos) ohne title sind nicht navigierbar.',
    fix: 'title-Attribut am <iframe> mit Inhaltsbeschreibung setzen.'
  },
  'video-caption': {
    title: 'Videos ohne Untertitel',
    why: 'Videoinhalte ohne Untertitel schließen gehörlose Nutzer aus. WCAG 1.2.2.',
    fix: 'Untertitel-Spur (<track kind="captions">) hinzufügen.'
  },
  'bypass': {
    title: 'Kein "Zum Inhalt springen"-Link',
    why: 'Tastatur-Nutzer müssen bei jeder Seite das ganze Menü durchtabben. WCAG 2.4.1.',
    fix: 'Skip-Link an den Seitenanfang setzen, der zum Hauptinhalt springt.'
  },
  'heading-order': {
    title: 'Überschriften nicht in logischer Reihenfolge',
    why: 'Übersprungene Ebenen (h1 -> h3) zerstören die Struktur für Screenreader-Navigation.',
    fix: 'Überschriften hierarchisch verschachteln (h1 -> h2 -> h3).'
  },
  'list': {
    title: 'Fehlerhafte Listenstruktur',
    why: 'Listen mit ungültigen Kindelementen werden falsch vorgelesen.',
    fix: 'In <ul>/<ol> nur <li> (bzw. erlaubte Elemente) verwenden.'
  },
  'listitem': {
    title: 'Listeneintrag ohne Listen-Container',
    why: '<li> außerhalb von <ul>/<ol> bricht die Listensemantik.',
    fix: '<li> in ein <ul> oder <ol> einbetten.'
  },
  'duplicate-id': {
    title: 'Doppelte ID-Attribute',
    why: 'Mehrfach vergebene IDs brechen Label-Verknüpfungen und ARIA-Referenzen.',
    fix: 'IDs eindeutig vergeben.'
  },
  'region': {
    title: 'Inhalte außerhalb von Landmarks',
    why: 'Inhalte ohne Landmark-Region erschweren die schnelle Navigation per Screenreader.',
    fix: 'Seitenbereiche in <header>, <nav>, <main>, <footer> gliedern.'
  },
  'landmark-one-main': {
    title: 'Kein eindeutiger Hauptbereich',
    why: 'Ohne genau ein <main> finden Screenreader-Nutzer den Kerninhalt schlechter.',
    fix: 'Den Hauptinhalt in genau ein <main> setzen.'
  },
  'page-has-heading-one': {
    title: 'Keine H1-Überschrift',
    why: 'Eine fehlende H1 erschwert Orientierung und schadet zugleich der SEO.',
    fix: 'Pro Seite eine eindeutige <h1> vergeben.'
  },
  'aria-roles': {
    title: 'Ungültige ARIA-Rolle',
    why: 'Falsche role-Werte verwirren assistive Technik mehr, als sie helfen.',
    fix: 'Nur gültige ARIA-Rollen verwenden oder native HTML-Elemente nutzen.'
  },
  'aria-valid-attr': {
    title: 'Ungültiges ARIA-Attribut',
    why: 'Nicht existierende aria-*-Attribute werden ignoriert und deuten auf Fehler hin.',
    fix: 'Nur gültige aria-*-Attribute verwenden.'
  },
  'aria-valid-attr-value': {
    title: 'Ungültiger ARIA-Attributwert',
    why: 'Falsche Werte (z. B. defekte aria-labelledby-Referenz) brechen die Ansage.',
    fix: 'Werte korrigieren, referenzierte IDs müssen existieren.'
  },
  'aria-required-attr': {
    title: 'Fehlende erforderliche ARIA-Attribute',
    why: 'ARIA-Rollen ohne ihre Pflicht-Attribute funktionieren nicht korrekt.',
    fix: 'Erforderliche aria-*-Attribute der jeweiligen Rolle ergänzen.'
  },
  'aria-allowed-attr': {
    title: 'Nicht erlaubtes ARIA-Attribut',
    why: 'Für die Rolle unzulässige Attribute führen zu unvorhersehbarem Verhalten.',
    fix: 'Nur für die Rolle erlaubte Attribute verwenden.'
  }
};

// Gewichtung nach axe-Impact für die Score-Berechnung.
export const IMPACT_WEIGHT = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1
};

export const IMPACT_DE = {
  critical: 'Kritisch',
  serious: 'Schwerwiegend',
  moderate: 'Mittel',
  minor: 'Gering'
};

// Deutsche Klartexte für den Cookie-/Consent-Scan (§ 25 TDDDG).
export const COOKIE_RULES = {
  'tracker-before-consent': {
    title: 'Tracker-Request vor Einwilligung beobachtet',
    why: 'Es wurde eine Anfrage an einen Tracking-/Werbe-Host beobachtet, bevor eine Einwilligung vorlag. Hinweis: bei korrektem Consent Mode v2 kann diese Anfrage cookielos und zulässig sein — bitte verifizieren. Hartes Signal sind gesetzte Cookies (siehe ggf. separater Punkt).',
    fix: 'Sicherstellen, dass Tracking erst NACH aktiver Einwilligung lädt bzw. vorher nur cookielose Consent-Mode-Signale sendet.'
  },
  'cookie-before-consent': {
    title: 'Nicht-notwendige Cookies vor Einwilligung gesetzt',
    why: 'Es werden Cookies gesetzt, bevor eine Einwilligung vorliegt. § 25 TDDDG erlaubt das nur für technisch zwingend notwendige Cookies.',
    fix: 'Nicht-essenzielle Cookies erst nach Opt-in setzen; Consent-Tool davorschalten.'
  },
  'no-cookie-banner': {
    title: 'Kein Cookie-/Consent-Banner erkennbar',
    why: 'Es laden Tracker, aber es ist kein Einwilligungs-Banner auffindbar. Ohne Einwilligungsmöglichkeit ist nicht-notwendiges Tracking unzulässig.',
    fix: 'Ein TCF-2.2-konformes Consent-Banner mit gleichwertigem „Ablehnen" einbinden, das Tracking erst nach Zustimmung freigibt.'
  },
  'google-fonts-hotlink': {
    title: 'Google Fonts dynamisch eingebunden',
    why: 'Google Fonts werden direkt von Google-Servern geladen — dabei wird die IP-Adresse des Besuchers in die USA übertragen. In DE war das wiederholt Abmahn-Thema.',
    fix: 'Schriften lokal hosten (self-hosted) statt von fonts.googleapis.com/fonts.gstatic.com zu laden.'
  },
  'us-transfer-before-consent': {
    title: 'US-Dienst vor Einwilligung kontaktiert',
    why: 'Ein Dienst mit US-Datenübermittlung wird vor Einwilligung geladen. Drittland-Transfer ohne Rechtsgrundlage/Consent ist datenschutzrechtlich riskant.',
    fix: 'US-Dienste erst nach Einwilligung laden oder EU-Alternative/Proxy nutzen.'
  }
};

export function ruleInfo(violation) {
  const mapped = RULES_DE[violation.id] || COOKIE_RULES[violation.id];
  if (mapped) return mapped;
  // Fallback auf axe-Originaltext, falls Regel nicht übersetzt ist.
  return {
    title: violation.help || violation.id,
    why: violation.description || 'WCAG-relevanter Mangel laut axe-core.',
    fix: 'Siehe Detail-Hinweis von axe-core: ' + (violation.helpUrl || '')
  };
}
