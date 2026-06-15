// Deutsche Klartext-Uebersetzung der haeufigsten axe-core-Regeln.
// Pro Regel: title (verstaendlicher Name), why (Geschaeftsrisiko/BFSG-Bezug),
// fix (konkrete Loesung). Unbekannte Regeln fallen auf axe-Hilfetext zurueck.

export const RULES_DE = {
  'image-alt': {
    title: 'Bilder ohne Alternativtext',
    why: 'Screenreader koennen den Bildinhalt nicht vorlesen. Klarer WCAG-1.1.1-Verstoss (Stufe A) — einer der haeufigsten Abmahn-Gruende.',
    fix: 'Jedem informativen <img> ein aussagekraeftiges alt-Attribut geben. Rein dekorative Bilder erhalten alt="".'
  },
  'input-image-alt': {
    title: 'Bild-Buttons ohne Alternativtext',
    why: 'Als Button genutzte Bilder (z. B. Suche-Lupe) sind fuer Screenreader-Nutzer nicht bedienbar.',
    fix: '<input type="image"> ein alt-Attribut geben, das die Aktion beschreibt (z. B. alt="Suchen").'
  },
  'area-alt': {
    title: 'Image-Map-Bereiche ohne Alternativtext',
    why: 'Verlinkte Bereiche einer Image-Map sind ohne Text nicht zugaenglich.',
    fix: 'Jedem <area> ein beschreibendes alt-Attribut geben.'
  },
  'role-img-alt': {
    title: 'Grafik-Elemente ohne Textalternative',
    why: 'Elemente mit role="img" brauchen einen zugaenglichen Namen, sonst fehlt der Inhalt fuer Screenreader.',
    fix: 'aria-label oder aria-labelledby ergaenzen.'
  },
  'svg-img-alt': {
    title: 'SVG-Grafiken ohne Textalternative',
    why: 'Informative SVGs ohne Beschriftung sind fuer assistive Technik unsichtbar.',
    fix: '<title>-Element im SVG oder aria-label am SVG ergaenzen.'
  },
  'object-alt': {
    title: 'Eingebettete Objekte ohne Textalternative',
    why: '<object>-Inhalte (PDFs, Flash-Reste, Embeds) sind ohne Alternativtext nicht zugaenglich.',
    fix: 'Alternativtext innerhalb des <object> oder via aria-label bereitstellen.'
  },
  'color-contrast': {
    title: 'Zu geringer Farbkontrast',
    why: 'Text mit zu wenig Kontrast ist fuer Menschen mit Sehschwaeche unlesbar. WCAG 1.4.3 (AA) — sehr haeufig und leicht messbar, daher beliebtes Abmahn-Ziel.',
    fix: 'Kontrast auf mindestens 4,5:1 (normaler Text) bzw. 3:1 (grosser Text) anheben. Text- oder Hintergrundfarbe anpassen.'
  },
  'link-name': {
    title: 'Links ohne erkennbaren Text',
    why: 'Links wie "hier klicken" oder leere Icon-Links liefern Screenreadern kein Ziel. WCAG 2.4.4.',
    fix: 'Sprechenden Linktext verwenden oder bei Icon-Links aria-label setzen.'
  },
  'button-name': {
    title: 'Schaltflaechen ohne Beschriftung',
    why: 'Buttons ohne Text/Label koennen per Tastatur/Screenreader nicht sinnvoll bedient werden. WCAG 4.1.2.',
    fix: 'Sichtbaren Button-Text oder aria-label ergaenzen.'
  },
  'input-button-name': {
    title: 'Eingabe-Buttons ohne Beschriftung',
    why: 'Submit-/Reset-Buttons ohne value/Label sind nicht eindeutig bedienbar.',
    fix: 'value-Attribut oder aria-label setzen.'
  },
  'label': {
    title: 'Formularfelder ohne Beschriftung',
    why: 'Eingabefelder ohne verknuepftes <label> sind fuer Screenreader unklar — kritisch bei Kontakt-/Bestellformularen. WCAG 1.3.1/4.1.2.',
    fix: '<label for="id"> mit dem Feld verknuepfen oder aria-label verwenden.'
  },
  'select-name': {
    title: 'Auswahlfelder ohne Beschriftung',
    why: '<select>-Dropdowns ohne Label sind nicht eindeutig zuordenbar.',
    fix: 'Mit <label> verknuepfen oder aria-label ergaenzen.'
  },
  'form-field-multiple-labels': {
    title: 'Formularfeld mit mehreren Labels',
    why: 'Mehrere Labels pro Feld fuehren zu widerspruechlicher Ansage im Screenreader.',
    fix: 'Pro Feld genau ein Label verwenden.'
  },
  'html-has-lang': {
    title: 'Fehlende Sprachangabe der Seite',
    why: 'Ohne lang-Attribut spricht der Screenreader Inhalte in falscher Sprache aus. WCAG 3.1.1.',
    fix: '<html lang="de"> setzen.'
  },
  'html-lang-valid': {
    title: 'Ungueltige Sprachangabe',
    why: 'Ein ungueltiger Sprachcode verhindert korrekte Aussprache.',
    fix: 'Gueltigen Code verwenden, z. B. lang="de".'
  },
  'document-title': {
    title: 'Fehlender Seitentitel',
    why: 'Ohne <title> fehlt die Orientierung in Tabs und fuer Screenreader. WCAG 2.4.2.',
    fix: 'Aussagekraeftigen, eindeutigen <title> je Seite vergeben.'
  },
  'meta-viewport': {
    title: 'Zoom unterdrueckt (Viewport)',
    why: 'user-scalable=no verhindert Vergroessern — Barriere fuer Menschen mit Sehschwaeche. WCAG 1.4.4.',
    fix: 'maximum-scale/user-scalable-Sperre aus dem viewport-Meta-Tag entfernen.'
  },
  'frame-title': {
    title: 'iFrames ohne Titel',
    why: 'Eingebettete Frames (Karten, Videos) ohne title sind nicht navigierbar.',
    fix: 'title-Attribut am <iframe> mit Inhaltsbeschreibung setzen.'
  },
  'video-caption': {
    title: 'Videos ohne Untertitel',
    why: 'Videoinhalte ohne Untertitel schliessen gehoerlose Nutzer aus. WCAG 1.2.2.',
    fix: 'Untertitel-Spur (<track kind="captions">) hinzufuegen.'
  },
  'bypass': {
    title: 'Kein "Zum Inhalt springen"-Link',
    why: 'Tastatur-Nutzer muessen bei jeder Seite das ganze Menue durchtabben. WCAG 2.4.1.',
    fix: 'Skip-Link an den Seitenanfang setzen, der zum Hauptinhalt springt.'
  },
  'heading-order': {
    title: 'Ueberschriften nicht in logischer Reihenfolge',
    why: 'Uebersprungene Ebenen (h1 -> h3) zerstoeren die Struktur fuer Screenreader-Navigation.',
    fix: 'Ueberschriften hierarchisch verschachteln (h1 -> h2 -> h3).'
  },
  'list': {
    title: 'Fehlerhafte Listenstruktur',
    why: 'Listen mit ungueltigen Kindelementen werden falsch vorgelesen.',
    fix: 'In <ul>/<ol> nur <li> (bzw. erlaubte Elemente) verwenden.'
  },
  'listitem': {
    title: 'Listeneintrag ohne Listen-Container',
    why: '<li> ausserhalb von <ul>/<ol> bricht die Listensemantik.',
    fix: '<li> in ein <ul> oder <ol> einbetten.'
  },
  'duplicate-id': {
    title: 'Doppelte ID-Attribute',
    why: 'Mehrfach vergebene IDs brechen Label-Verknuepfungen und ARIA-Referenzen.',
    fix: 'IDs eindeutig vergeben.'
  },
  'region': {
    title: 'Inhalte ausserhalb von Landmarks',
    why: 'Inhalte ohne Landmark-Region erschweren die schnelle Navigation per Screenreader.',
    fix: 'Seitenbereiche in <header>, <nav>, <main>, <footer> gliedern.'
  },
  'landmark-one-main': {
    title: 'Kein eindeutiger Hauptbereich',
    why: 'Ohne genau ein <main> finden Screenreader-Nutzer den Kerninhalt schlechter.',
    fix: 'Den Hauptinhalt in genau ein <main> setzen.'
  },
  'page-has-heading-one': {
    title: 'Keine H1-Ueberschrift',
    why: 'Eine fehlende H1 erschwert Orientierung und schadet zugleich der SEO.',
    fix: 'Pro Seite eine eindeutige <h1> vergeben.'
  },
  'aria-roles': {
    title: 'Ungueltige ARIA-Rolle',
    why: 'Falsche role-Werte verwirren assistive Technik mehr, als sie helfen.',
    fix: 'Nur gueltige ARIA-Rollen verwenden oder native HTML-Elemente nutzen.'
  },
  'aria-valid-attr': {
    title: 'Ungueltiges ARIA-Attribut',
    why: 'Nicht existierende aria-*-Attribute werden ignoriert und deuten auf Fehler hin.',
    fix: 'Nur gueltige aria-*-Attribute verwenden.'
  },
  'aria-valid-attr-value': {
    title: 'Ungueltiger ARIA-Attributwert',
    why: 'Falsche Werte (z. B. defekte aria-labelledby-Referenz) brechen die Ansage.',
    fix: 'Werte korrigieren, referenzierte IDs muessen existieren.'
  },
  'aria-required-attr': {
    title: 'Fehlende erforderliche ARIA-Attribute',
    why: 'ARIA-Rollen ohne ihre Pflicht-Attribute funktionieren nicht korrekt.',
    fix: 'Erforderliche aria-*-Attribute der jeweiligen Rolle ergaenzen.'
  },
  'aria-allowed-attr': {
    title: 'Nicht erlaubtes ARIA-Attribut',
    why: 'Fuer die Rolle unzulaessige Attribute fuehren zu unvorhersehbarem Verhalten.',
    fix: 'Nur fuer die Rolle erlaubte Attribute verwenden.'
  }
};

// Gewichtung nach axe-Impact fuer die Score-Berechnung.
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
  // Fallback auf axe-Originaltext, falls Regel nicht uebersetzt ist.
  return {
    title: violation.help || violation.id,
    why: violation.description || 'WCAG-relevanter Mangel laut axe-core.',
    fix: 'Siehe Detail-Hinweis von axe-core: ' + (violation.helpUrl || '')
  };
}
