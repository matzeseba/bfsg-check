// Deutsche Klartext-Übersetzung der häufigsten axe-core-Regeln.
// Pro Regel: title (verständlicher Name), why (Geschäftsrisiko/BFSG-Bezug),
// fix (konkrete Lösung), effort (Umsetzungsaufwand S/M/L), category (Themen-
// Gruppe für die Report-Gliederung) und norm (WCAG-Erfolgskriterium bzw. bei
// Cookie-Regeln die einschlägige Norm — für die Umsetzungs-Checkliste).
// Unbekannte Regeln fallen auf einen deutschen generischen Text zurück
// (siehe ruleInfo).

export const RULES_DE = {
  'image-alt': {
    title: 'Bilder ohne Alternativtext',
    why: 'Screenreader können den Bildinhalt nicht vorlesen. Klarer WCAG-1.1.1-Verstoß (Stufe A) — einer der häufigsten Abmahn-Gründe.',
    fix: 'Jedem informativen <img> ein aussagekräftiges alt-Attribut geben. Rein dekorative Bilder erhalten alt="".',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '1.1.1 (A)'
  },
  'input-image-alt': {
    title: 'Bild-Buttons ohne Alternativtext',
    why: 'Als Button genutzte Bilder (z. B. Suche-Lupe) sind für Screenreader-Nutzer nicht bedienbar.',
    fix: '<input type="image"> ein alt-Attribut geben, das die Aktion beschreibt (z. B. alt="Suchen").',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '1.1.1 (A)'
  },
  'area-alt': {
    title: 'Image-Map-Bereiche ohne Alternativtext',
    why: 'Verlinkte Bereiche einer Image-Map sind ohne Text nicht zugänglich.',
    fix: 'Jedem <area> ein beschreibendes alt-Attribut geben.',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '2.4.4 (A) / 4.1.2 (A)'
  },
  'role-img-alt': {
    title: 'Grafik-Elemente ohne Textalternative',
    why: 'Elemente mit role="img" brauchen einen zugänglichen Namen, sonst fehlt der Inhalt für Screenreader.',
    fix: 'aria-label oder aria-labelledby ergänzen.',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '1.1.1 (A)'
  },
  'svg-img-alt': {
    title: 'SVG-Grafiken ohne Textalternative',
    why: 'Informative SVGs ohne Beschriftung sind für assistive Technik unsichtbar.',
    fix: '<title>-Element im SVG oder aria-label am SVG ergänzen.',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '1.1.1 (A)'
  },
  'object-alt': {
    title: 'Eingebettete Objekte ohne Textalternative',
    why: '<object>-Inhalte (PDFs, Flash-Reste, Embeds) sind ohne Alternativtext nicht zugänglich.',
    fix: 'Alternativtext innerhalb des <object> oder via aria-label bereitstellen.',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: '1.1.1 (A)'
  },
  'color-contrast': {
    title: 'Zu geringer Farbkontrast',
    why: 'Text mit zu wenig Kontrast ist für Menschen mit Sehschwäche unlesbar. WCAG 1.4.3 (AA) — sehr häufig und leicht messbar, daher beliebtes Abmahn-Ziel.',
    fix: 'Kontrast auf mindestens 4,5:1 (normaler Text) bzw. 3:1 (großer Text) anheben. Text- oder Hintergrundfarbe anpassen.',
    effort: 'M',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '1.4.3 (AA)'
  },
  'link-name': {
    title: 'Links ohne erkennbaren Text',
    why: 'Links wie "hier klicken" oder leere Icon-Links liefern Screenreadern kein Ziel. WCAG 2.4.4.',
    fix: 'Sprechenden Linktext verwenden oder bei Icon-Links aria-label setzen.',
    effort: 'S',
    category: 'Links, Schaltflächen & Bedienelemente',
    norm: '2.4.4 (A) / 4.1.2 (A)'
  },
  'button-name': {
    title: 'Schaltflächen ohne Beschriftung',
    why: 'Buttons ohne Text/Label können per Tastatur/Screenreader nicht sinnvoll bedient werden. WCAG 4.1.2.',
    fix: 'Sichtbaren Button-Text oder aria-label ergänzen.',
    effort: 'S',
    category: 'Links, Schaltflächen & Bedienelemente',
    norm: '4.1.2 (A)'
  },
  'input-button-name': {
    title: 'Eingabe-Buttons ohne Beschriftung',
    why: 'Submit-/Reset-Buttons ohne value/Label sind nicht eindeutig bedienbar.',
    fix: 'value-Attribut oder aria-label setzen.',
    effort: 'S',
    category: 'Links, Schaltflächen & Bedienelemente',
    norm: '4.1.2 (A)'
  },
  'label': {
    title: 'Formularfelder ohne Beschriftung',
    why: 'Eingabefelder ohne verknüpftes <label> sind für Screenreader unklar — kritisch bei Kontakt-/Bestellformularen. WCAG 1.3.1/4.1.2.',
    fix: '<label for="id"> mit dem Feld verknüpfen oder aria-label verwenden.',
    effort: 'S',
    category: 'Formulare & Eingabe',
    norm: '1.3.1 (A) / 4.1.2 (A)'
  },
  'select-name': {
    title: 'Auswahlfelder ohne Beschriftung',
    why: '<select>-Dropdowns ohne Label sind nicht eindeutig zuordenbar.',
    fix: 'Mit <label> verknüpfen oder aria-label ergänzen.',
    effort: 'S',
    category: 'Formulare & Eingabe',
    norm: '4.1.2 (A)'
  },
  'form-field-multiple-labels': {
    title: 'Formularfeld mit mehreren Labels',
    why: 'Mehrere Labels pro Feld führen zu widersprüchlicher Ansage im Screenreader.',
    fix: 'Pro Feld genau ein Label verwenden.',
    effort: 'S',
    category: 'Formulare & Eingabe',
    norm: '3.3.2 (A)'
  },
  'html-has-lang': {
    title: 'Fehlende Sprachangabe der Seite',
    why: 'Ohne lang-Attribut spricht der Screenreader Inhalte in falscher Sprache aus. WCAG 3.1.1.',
    fix: '<html lang="de"> setzen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '3.1.1 (A)'
  },
  'html-lang-valid': {
    title: 'Ungültige Sprachangabe',
    why: 'Ein ungültiger Sprachcode verhindert korrekte Aussprache.',
    fix: 'Gültigen Code verwenden, z. B. lang="de".',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '3.1.1 (A)'
  },
  'document-title': {
    title: 'Fehlender Seitentitel',
    why: 'Ohne <title> fehlt die Orientierung in Tabs und für Screenreader. WCAG 2.4.2.',
    fix: 'Aussagekräftigen, eindeutigen <title> je Seite vergeben.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '2.4.2 (A)'
  },
  'meta-viewport': {
    title: 'Zoom unterdrückt (Viewport)',
    why: 'user-scalable=no verhindert Vergrößern — Barriere für Menschen mit Sehschwäche. WCAG 1.4.4.',
    fix: 'maximum-scale/user-scalable-Sperre aus dem viewport-Meta-Tag entfernen.',
    effort: 'S',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '1.4.4 (AA)'
  },
  'frame-title': {
    title: 'iFrames ohne Titel',
    why: 'Eingebettete Frames (Karten, Videos) ohne title sind nicht navigierbar.',
    fix: 'title-Attribut am <iframe> mit Inhaltsbeschreibung setzen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '4.1.2 (A)'
  },
  'video-caption': {
    title: 'Videos ohne Untertitel',
    why: 'Videoinhalte ohne Untertitel schließen gehörlose Nutzer aus. WCAG 1.2.2.',
    fix: 'Untertitel-Spur (<track kind="captions">) hinzufügen.',
    effort: 'M',
    category: 'Bilder & Medien',
    norm: '1.2.2 (A)'
  },
  'bypass': {
    title: 'Kein "Zum Inhalt springen"-Link',
    why: 'Tastatur-Nutzer müssen bei jeder Seite das ganze Menü durchtabben. WCAG 2.4.1.',
    fix: 'Skip-Link an den Seitenanfang setzen, der zum Hauptinhalt springt.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: '2.4.1 (A)'
  },
  'heading-order': {
    title: 'Überschriften nicht in logischer Reihenfolge',
    why: 'Übersprungene Ebenen (h1 → h3) zerstören die Struktur für Screenreader-Navigation.',
    fix: 'Überschriften hierarchisch verschachteln (h1 → h2 → h3).',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (verwandt zu 1.3.1)'
  },
  'list': {
    title: 'Fehlerhafte Listenstruktur',
    why: 'Listen mit ungültigen Kindelementen werden falsch vorgelesen.',
    fix: 'In <ul>/<ol> nur <li> (bzw. erlaubte Elemente) verwenden.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '1.3.1 (A)'
  },
  'listitem': {
    title: 'Listeneintrag ohne Listen-Container',
    why: '<li> außerhalb von <ul>/<ol> bricht die Listensemantik.',
    fix: '<li> in ein <ul> oder <ol> einbetten.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '1.3.1 (A)'
  },
  'region': {
    title: 'Inhalte außerhalb von Landmarks',
    why: 'Inhalte ohne Landmark-Region erschweren die schnelle Navigation per Screenreader.',
    fix: 'Seitenbereiche in <header>, <nav>, <main>, <footer> gliedern.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-one-main': {
    title: 'Kein eindeutiger Hauptbereich',
    why: 'Ohne genau ein <main> finden Screenreader-Nutzer den Kerninhalt schlechter.',
    fix: 'Den Hauptinhalt in genau ein <main> setzen.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'page-has-heading-one': {
    title: 'Keine H1-Überschrift',
    why: 'Eine fehlende H1 erschwert Orientierung und schadet zugleich der SEO.',
    fix: 'Pro Seite eine eindeutige <h1> vergeben.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'aria-roles': {
    title: 'Ungültige ARIA-Rolle',
    why: 'Falsche role-Werte verwirren assistive Technik mehr, als sie helfen.',
    fix: 'Nur gültige ARIA-Rollen verwenden oder native HTML-Elemente nutzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-valid-attr': {
    title: 'Ungültiges ARIA-Attribut',
    why: 'Nicht existierende aria-*-Attribute werden ignoriert und deuten auf Fehler hin.',
    fix: 'Nur gültige aria-*-Attribute verwenden.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-valid-attr-value': {
    title: 'Ungültiger ARIA-Attributwert',
    why: 'Falsche Werte (z. B. defekte aria-labelledby-Referenz) brechen die Ansage.',
    fix: 'Werte korrigieren, referenzierte IDs müssen existieren.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-required-attr': {
    title: 'Fehlende erforderliche ARIA-Attribute',
    why: 'ARIA-Rollen ohne ihre Pflicht-Attribute funktionieren nicht korrekt.',
    fix: 'Erforderliche aria-*-Attribute der jeweiligen Rolle ergänzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-allowed-attr': {
    title: 'Nicht erlaubtes ARIA-Attribut',
    why: 'Für die Rolle unzulässige Attribute führen zu unvorhersehbarem Verhalten.',
    fix: 'Nur für die Rolle erlaubte Attribute verwenden.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },

  // --- Ergänzt (F4): restliche aktive axe-core-Regeln (wcag2a/aa, wcag21a/aa, wcag22aa, best-practice) ---
  'accesskeys': {
    title: 'Mehrfach vergebene Accesskey-Werte',
    why: 'Nutzen mehrere Elemente denselben accesskey-Wert, ist die Tastenkombination nicht eindeutig — Tastatur-Nutzer springen zufällig zum falschen Element.',
    fix: 'Jeden accesskey-Wert nur einmal pro Seite vergeben oder ganz auf accesskey verzichten und die Standard-Tab-Reihenfolge nutzen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'aria-allowed-role': {
    title: 'Unpassende ARIA-Rolle für das Element',
    why: 'Der gesetzte role-Wert passt nicht zum HTML-Element (z. B. role="button" auf einem <img>) — assistive Technik kündigt eine falsche Semantik an.',
    fix: 'role entfernen oder durch einen für das Element zulässigen Wert ersetzen; wo möglich natives HTML-Element statt ARIA-Rolle verwenden.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: 'Best Practice'
  },
  'aria-braille-equivalent': {
    title: 'Braille-Label ohne Text-Äquivalent',
    why: 'aria-braillelabel/aria-brailleroledescription ohne begleitendes aria-label bzw. aria-roledescription liefern Screenreadern ohne Braillezeile keine Information. WCAG 4.1.2.',
    fix: 'Zu jedem aria-braillelabel ein aria-label und zu aria-brailleroledescription ein aria-roledescription mit gleichwertigem Inhalt ergänzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-command-name': {
    title: 'ARIA-Button/-Link/-Menüpunkt ohne zugänglichen Namen',
    why: 'Elemente mit role="button", "link" oder "menuitem" ohne erkennbaren Text sind für Screenreader-Nutzer nicht bedienbar. WCAG 4.1.2.',
    fix: 'Sichtbaren Text, aria-label oder aria-labelledby ergänzen.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-conditional-attr': {
    title: 'ARIA-Attribut nur in bestimmtem Rollen-Zustand zulässig',
    why: 'Ein ARIA-Attribut wird in einem Rollen-Zustand verwendet, den die Spezifikation dafür nicht vorsieht — assistive Technik kann den Zustand falsch interpretieren.',
    fix: 'Attribut gemäß WAI-ARIA-Spezifikation nur im vorgesehenen Rollen-Zustand setzen bzw. entfernen.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-deprecated-role': {
    title: 'Veraltete ARIA-Rolle verwendet',
    why: 'Als deprecated markierte Rollen werden von aktueller assistiver Technik nicht mehr zuverlässig unterstützt.',
    fix: 'Rolle durch die aktuelle WAI-ARIA-Entsprechung ersetzen (z. B. eine passende Listen- oder Navigations-Struktur).',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-dialog-name': {
    title: 'Dialog ohne zugänglichen Namen',
    why: 'Elemente mit role="dialog"/"alertdialog" ohne Namen lassen Screenreader-Nutzer im Unklaren, welcher Dialog sich geöffnet hat. WCAG 4.1.2.',
    fix: 'aria-label oder aria-labelledby am Dialog-Element ergänzen, das auf die Dialog-Überschrift verweist.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: 'Best Practice (verwandt zu 4.1.2)'
  },
  'aria-hidden-body': {
    title: 'aria-hidden="true" auf dem <body>',
    why: 'Ist der komplette body per aria-hidden versteckt, blendet das die gesamte Seite für Screenreader aus.',
    fix: 'aria-hidden="true" vom <body>-Element entfernen (häufig ein Rest von Modal-/Overlay-Bibliotheken, der beim Schließen nicht zurückgesetzt wurde).',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '1.3.1 (A) / 4.1.2 (A)'
  },
  'aria-hidden-focus': {
    title: 'Fokussierbare Elemente unter aria-hidden',
    why: 'aria-hidden="true" versteckt einen Bereich vor Screenreadern, enthält aber weiterhin per Tab erreichbare Elemente — Tastatur-Nutzer landen in unsichtbarem Inhalt. WCAG 4.1.2.',
    fix: 'Fokussierbare Kindelemente (Links, Buttons, Inputs) zusätzlich mit tabindex="-1" bzw. inert versehen oder aria-hidden vom Container entfernen.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-input-field-name': {
    title: 'ARIA-Eingabefeld ohne zugänglichen Namen',
    why: 'Elemente mit einer ARIA-Eingabefeld-Rolle (z. B. role="searchbox", "spinbutton") ohne Namen sind für Screenreader-Nutzer nicht ausfüllbar. WCAG 4.1.2.',
    fix: 'aria-label, aria-labelledby oder ein verknüpftes <label> ergänzen.',
    effort: 'M',
    category: 'Formulare & Eingabe',
    norm: '4.1.2 (A)'
  },
  'aria-meter-name': {
    title: 'ARIA-Meter ohne zugänglichen Namen',
    why: 'role="meter"-Elemente ohne Namen teilen Screenreader-Nutzern nicht mit, was gemessen wird (z. B. Batteriestand, Auslastung).',
    fix: 'aria-label oder aria-labelledby am Meter-Element ergänzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '1.1.1 (A)'
  },
  'aria-progressbar-name': {
    title: 'ARIA-Fortschrittsbalken ohne zugänglichen Namen',
    why: 'role="progressbar"-Elemente ohne Namen sind für Screenreader-Nutzer nicht verständlich.',
    fix: 'aria-label oder aria-labelledby ergänzen, das beschreibt, wofür der Fortschritt steht.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '1.1.1 (A)'
  },
  'aria-prohibited-attr': {
    title: 'Für die Rolle nicht zulässiges ARIA-Attribut',
    why: 'Das gesetzte aria-*-Attribut ist für die aktuelle Rolle bzw. das Element ausdrücklich untersagt und wird von assistiver Technik ignoriert oder falsch interpretiert.',
    fix: 'Attribut entfernen oder auf ein Element/eine Rolle wechseln, das dieses Attribut unterstützt.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-required-children': {
    title: 'ARIA-Rolle ohne vorgeschriebene Kind-Rollen',
    why: 'Rollen wie "list" oder "tablist" erfordern bestimmte Kindelemente (z. B. "listitem"); fehlen sie, meldet der Screenreader eine unvollständige oder falsche Struktur.',
    fix: 'Die laut WAI-ARIA erforderlichen Kindelemente mit passender role ergänzen oder native HTML-Struktur (z. B. <ul><li>) verwenden.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '1.3.1 (A)'
  },
  'aria-required-parent': {
    title: 'ARIA-Rolle ohne vorgeschriebenes Eltern-Element',
    why: 'Rollen wie "listitem" oder "option" müssen in einem passenden Container (z. B. role="list"/"listbox") stehen, sonst ist die Struktur für assistive Technik unklar.',
    fix: 'Element in den laut WAI-ARIA erforderlichen Container mit passender Rolle einbetten.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '1.3.1 (A)'
  },
  'aria-roledescription': {
    title: 'aria-roledescription auf Element ohne Rolle',
    why: 'aria-roledescription überschreibt die Rollenansage nur, wenn eine implizite oder explizite Rolle existiert — sonst wird es ignoriert und die Beschriftung geht verloren.',
    fix: 'Dem Element eine passende role geben oder aria-roledescription entfernen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-text': {
    title: 'role="text" mit fokussierbaren Kindelementen',
    why: 'role="text" ist nur für rein statischen Text vorgesehen; enthält der Bereich fokussierbare Elemente, werden diese von manchen Screenreadern übersprungen.',
    fix: 'role="text" nur auf Elemente ohne interaktive bzw. fokussierbare Kinder setzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: 'Best Practice'
  },
  'aria-toggle-field-name': {
    title: 'ARIA-Schaltfeld ohne zugänglichen Namen',
    why: 'Toggle-Felder wie role="switch" oder role="checkbox" ohne Namen sind für Screenreader-Nutzer nicht zuordenbar. WCAG 4.1.2.',
    fix: 'aria-label, aria-labelledby oder ein verknüpftes <label> ergänzen.',
    effort: 'M',
    category: 'Formulare & Eingabe',
    norm: '4.1.2 (A)'
  },
  'aria-tooltip-name': {
    title: 'ARIA-Tooltip ohne zugänglichen Namen',
    why: 'role="tooltip"-Elemente ohne Namen liefern Screenreadern keinen Inhalt.',
    fix: 'aria-label oder sichtbaren Text im Tooltip-Element ergänzen.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'aria-treeitem-name': {
    title: 'ARIA-Baumeintrag ohne zugänglichen Namen',
    why: 'role="treeitem"-Elemente ohne Namen sind in Baumnavigationen für Screenreader-Nutzer nicht unterscheidbar.',
    fix: 'aria-label, aria-labelledby oder sichtbaren Text ergänzen.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: 'Best Practice (verwandt zu 4.1.2)'
  },
  'audio-caption': {
    title: 'Audio-Inhalte ohne Transkript',
    why: 'Reine Audio-Elemente ohne Textalternative schließen gehörlose und schwerhörige Nutzer aus. WCAG 1.2.1.',
    fix: 'Ein Transkript des gesprochenen Inhalts bereitstellen (z. B. verlinkt oder direkt unter dem Player).',
    effort: 'M',
    category: 'Bilder & Medien',
    norm: '1.2.1 (A)'
  },
  'autocomplete-valid': {
    title: 'Ungültiger autocomplete-Wert',
    why: 'Ein fehlerhafter autocomplete-Wert verhindert, dass Ausfüllhilfen und assistive Technik das Feld korrekt automatisch befüllen können. WCAG 1.3.5.',
    fix: 'Nur gültige HTML-Autofill-Tokens verwenden (z. B. autocomplete="email", "given-name", "tel").',
    effort: 'S',
    category: 'Formulare & Eingabe',
    norm: '1.3.5 (AA)'
  },
  'avoid-inline-spacing': {
    title: 'Textabstände per Inline-Style fixiert',
    why: 'Über style="line-height/letter-spacing/word-spacing" fest gesetzte Abstände lassen sich von Nutzern mit eigenem Stylesheet (Sehbehinderung) nicht mehr anpassen. WCAG 1.4.12.',
    fix: 'Abstände über CSS-Klassen statt fixierter Inline-Styles setzen, damit Nutzer-Stylesheets sie überschreiben können.',
    effort: 'M',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '1.4.12 (AA)'
  },
  'blink': {
    title: '<blink>-Element verwendet',
    why: 'Blinkender Text ist veraltet, kann Krampfanfälle begünstigen und wird von Screenreadern ignoriert. WCAG 2.2.2.',
    fix: '<blink> entfernen; falls Aufmerksamkeit nötig ist, eine dezente CSS-Hervorhebung ohne Blinken verwenden.',
    effort: 'S',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '2.2.2 (A)'
  },
  'css-orientation-lock': {
    title: 'Inhalt an eine Bildschirmausrichtung gesperrt',
    why: 'Per CSS auf Hoch- oder Querformat gesperrte Inhalte sind für Nutzer mit fest montiertem Gerät (z. B. Rollstuhl-Halterung) nicht bedienbar. WCAG 1.3.4.',
    fix: 'CSS-Orientation-Lock (@media (orientation: …)) entfernen bzw. das Layout für beide Ausrichtungen anbieten.',
    effort: 'L',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '1.3.4 (AA)'
  },
  'definition-list': {
    title: 'Fehlerhafte Definitionsliste',
    why: 'Ein <dl>, das nicht nur aus <dt>/<dd>-Paaren (ggf. gruppiert in <div>) besteht, wird von Screenreadern nicht als Definitionsliste erkannt.',
    fix: '<dl> ausschließlich mit <dt>/<dd>-Elementen befüllen.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: '1.3.1 (A)'
  },
  'dlitem': {
    title: '<dt>/<dd> ohne umschließendes <dl>',
    why: 'Definitionslisten-Einträge außerhalb eines <dl> verlieren ihre Semantik für Screenreader.',
    fix: '<dt>/<dd> in ein <dl>-Element einbetten.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '1.3.1 (A)'
  },
  'duplicate-id-aria': {
    title: 'Doppelte ID in ARIA-Referenz oder Label',
    why: 'Wird eine ID mehrfach vergeben, auf die aria-labelledby/aria-describedby oder ein <label for> verweist, ist die Referenz mehrdeutig und die Ansage im Screenreader unzuverlässig. WCAG 4.1.2.',
    fix: 'Betroffene IDs eindeutig vergeben, insbesondere bei Komponenten, die mehrfach auf einer Seite eingebunden werden.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'empty-heading': {
    title: 'Leere Überschrift',
    why: 'Eine <h1>-<h6> ohne erkennbaren Text erzeugt einen Navigationspunkt ohne Inhalt und verwirrt Screenreader-Nutzer, die per Überschrift springen. WCAG 2.4.6.',
    fix: 'Überschrift mit Text füllen oder das leere Element entfernen, falls es nur aus Styling-Gründen existiert.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (verwandt zu 2.4.6)'
  },
  'empty-table-header': {
    title: 'Leere Tabellen-Kopfzelle',
    why: 'Ein <th> ohne Text liefert Screenreadern beim Vorlesen der Zellen keine Spalten-/Zeilenbezeichnung.',
    fix: 'Tabellenkopfzelle mit einem beschreibenden Text füllen (bei Bedarf visuell versteckt, aber für Screenreader vorhanden).',
    effort: 'S',
    category: 'Tabellen',
    norm: 'Best Practice'
  },
  'focus-order-semantics': {
    title: 'Fokussierbares Element mit unpassender Rolle',
    why: 'Ein Element, das per tabindex in die Fokus-Reihenfolge aufgenommen wurde, aber keine interaktive Rolle hat, verwirrt Tastatur-Nutzer, die auf ein funktionsloses Element springen.',
    fix: 'Dem Element eine passende interaktive Rolle (z. B. role="button") mit den nötigen Tastatur-Handlern geben oder tabindex entfernen.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'frame-focusable-content': {
    title: 'Fokussierbarer iFrame-Inhalt mit tabindex="-1"',
    why: 'Ein <iframe>, dessen Inhalt fokussierbare Elemente enthält, aber selbst tabindex="-1" trägt, unterbricht die Tab-Reihenfolge für Tastatur-Nutzer.',
    fix: 'tabindex="-1" vom <iframe> entfernen, wenn der Frame-Inhalt fokussierbare Elemente enthält.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '2.1.1 (A)'
  },
  'frame-tested': {
    title: 'iFrame-Inhalt nicht automatisiert prüfbar',
    why: 'Der Inhalt dieses Frames konnte technisch nicht mitgescannt werden (z. B. Cross-Origin-Einbettung) — mögliche Barrieren dort bleiben unentdeckt, solange er nicht separat geprüft wird.',
    fix: 'iFrame-Inhalt eigenständig mit einem Accessibility-Scanner prüfen, sofern er von einer anderen Domain eingebunden ist.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (Hinweis)'
  },
  'frame-title-unique': {
    title: 'Mehrere iFrames mit identischem Titel',
    why: 'Tragen mehrere <iframe>/<frame> denselben title, kann ein Screenreader-Nutzer die Frames nicht unterscheiden.',
    fix: 'Jedem Frame ein eindeutiges, beschreibendes title-Attribut geben.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '4.1.2 (A)'
  },
  'hidden-content': {
    title: 'Versteckter Inhalt auf der Seite gefunden',
    why: 'Hinweis-Regel: Es wurde per CSS (display:none, visibility:hidden) versteckter Inhalt entdeckt, der von der automatisierten Prüfung nicht bewertet werden kann.',
    fix: 'Versteckten Bereich bei Bedarf manuell prüfen bzw. vor der Freigabe sichtbar machen/einblenden.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (Hinweis)'
  },
  'html-xml-lang-mismatch': {
    title: 'Widersprüchliche lang- und xml:lang-Angabe',
    why: 'Weichen lang und xml:lang am <html>-Element voneinander ab, ist unklar, welche Sprache Screenreader verwenden sollen.',
    fix: 'lang und xml:lang auf denselben Sprachcode setzen oder xml:lang entfernen (im HTML5-Dokument meist überflüssig).',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '3.1.1 (A)'
  },
  'image-redundant-alt': {
    title: 'Alternativtext wiederholt den sichtbaren Text',
    why: 'Wird derselbe Text als Bild-alt UND als sichtbarer Text daneben ausgegeben, hört ein Screenreader-Nutzer die Information doppelt.',
    fix: 'Bei Bildern neben identischem Text alt="" setzen (dekorativ) oder den Alternativtext auf zusätzliche Information beschränken.',
    effort: 'S',
    category: 'Bilder & Medien',
    norm: 'Best Practice'
  },
  'label-content-name-mismatch': {
    title: 'Sichtbarer Text weicht vom zugänglichen Namen ab',
    why: 'Enthält der zugängliche Name (aria-label) nicht den sichtbaren Text, können Spracheingabe-Nutzer ("Klicke auf [sichtbarer Text]") das Element nicht ansteuern. WCAG 2.5.3.',
    fix: 'aria-label so wählen, dass es mit dem sichtbaren Text beginnt oder ihn vollständig enthält.',
    effort: 'M',
    category: 'Formulare & Eingabe',
    norm: '2.5.3 (A)'
  },
  'label-title-only': {
    title: 'Formularfeld nur über title/aria-describedby beschriftet',
    why: 'Ein Feld ohne sichtbares <label>, das nur über das title-Attribut oder aria-describedby "beschriftet" ist, zeigt sehenden Nutzern keine Beschriftung und wird von manchen Screenreadern nicht als Label erkannt.',
    fix: 'Ein sichtbares <label> ergänzen (title/aria-describedby können als Zusatzinfo bestehen bleiben).',
    effort: 'M',
    category: 'Formulare & Eingabe',
    norm: 'Best Practice'
  },
  'landmark-banner-is-top-level': {
    title: 'banner-Landmark nicht auf oberster Ebene',
    why: 'Ein <header>/role="banner" innerhalb von <article>, <aside> oder <main> wird nicht als Seiten-Kopfbereich erkannt, was die Landmark-Navigation verfälscht.',
    fix: 'Das banner-Element direkt als Kind von <body> platzieren, nicht in andere Landmarks verschachteln.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-complementary-is-top-level': {
    title: 'complementary-Landmark nicht auf oberster Ebene',
    why: 'Ein <aside>/role="complementary" innerhalb einer anderen Landmark wird von Screenreadern nicht als eigenständiger Ergänzungsbereich gelistet.',
    fix: '<aside> auf oberster Ebene platzieren (direktes Kind von <body> bzw. außerhalb anderer Landmarks).',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-contentinfo-is-top-level': {
    title: 'contentinfo-Landmark (Footer) nicht auf oberster Ebene',
    why: 'Ein <footer>/role="contentinfo" innerhalb einer anderen Landmark wird nicht als Seiten-Fußbereich erkannt.',
    fix: '<footer> auf oberster Ebene platzieren, nicht in <main> oder <article> verschachteln.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-main-is-top-level': {
    title: 'main-Landmark nicht auf oberster Ebene',
    why: 'Ein verschachteltes <main> (z. B. innerhalb eines anderen Landmarks) wird von Screenreadern nicht zuverlässig als Hauptbereich erkannt.',
    fix: '<main> auf oberster Ebene direkt in <body> platzieren.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-no-duplicate-banner': {
    title: 'Mehr als ein banner-Landmark auf der Seite',
    why: 'Mehrere <header role="banner">-Bereiche verwirren die Landmark-Navigation — es sollte genau einen Seiten-Kopfbereich geben.',
    fix: 'Nur einen <header> mit role="banner" verwenden; weitere Header-Elemente (z. B. in Artikeln) ohne banner-Rolle auszeichnen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-no-duplicate-contentinfo': {
    title: 'Mehr als ein contentinfo-Landmark auf der Seite',
    why: 'Mehrere Footer mit role="contentinfo" erschweren die eindeutige Navigation zum Seiten-Fußbereich.',
    fix: 'Nur einen Footer mit contentinfo-Rolle verwenden, bei weiteren die Rolle entfernen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-no-duplicate-main': {
    title: 'Mehr als ein main-Landmark auf der Seite',
    why: 'Mehrere <main>-Bereiche widersprechen der HTML-Spezifikation und verhindern eindeutige Navigation zum Hauptinhalt.',
    fix: 'Nur ein <main>-Element pro Seite verwenden.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice'
  },
  'landmark-unique': {
    title: 'Landmarks nicht eindeutig unterscheidbar',
    why: 'Mehrere Landmarks derselben Rolle ohne unterscheidendes aria-label (z. B. zwei <nav>) können von Screenreader-Nutzern nicht auseinandergehalten werden. WCAG 1.3.1/4.1.2.',
    fix: 'Jeder gleichartigen Landmark ein eigenes aria-label geben (z. B. aria-label="Hauptnavigation" bzw. "Fußzeilen-Navigation").',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (verwandt zu 1.3.1/4.1.2)'
  },
  'link-in-text-block': {
    title: 'Link im Fließtext nur farblich hervorgehoben',
    why: 'Ist ein Link im Textabsatz ausschließlich über Farbe erkennbar (keine Unterstreichung o. Ä.), können Nutzer mit Farbsehschwäche ihn nicht vom umgebenden Text unterscheiden. WCAG 1.4.1.',
    fix: 'Links im Fließtext zusätzlich unterstreichen oder anderweitig nicht-farblich hervorheben.',
    effort: 'M',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '1.4.1 (A)'
  },
  'marquee': {
    title: '<marquee>-Element verwendet',
    why: 'Automatisch scrollender Text ist veraltet, kann nicht pausiert werden und wird von Screenreadern nicht sinnvoll vorgelesen. WCAG 2.2.2.',
    fix: '<marquee> durch statischen Text oder eine steuerbare, pausierbare Alternative ersetzen.',
    effort: 'S',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '2.2.2 (A)'
  },
  'meta-refresh': {
    title: 'Automatische Seiten-Weiterleitung per Meta-Refresh',
    why: 'Ein <meta http-equiv="refresh"> mit Zeitverzögerung leitet die Seite automatisch um oder lädt sie neu, bevor Screenreader-/Tastatur-Nutzer fertig gelesen haben. WCAG 2.2.1/2.2.4.',
    fix: 'Meta-Refresh entfernen und die Weiterleitung serverseitig (301/302) oder nutzergesteuert umsetzen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '2.2.1 (A)'
  },
  'meta-viewport-large': {
    title: 'Viewport erlaubt keine ausreichende Vergrößerung',
    why: 'Ein zu niedriger maximum-scale-Wert im viewport-Meta-Tag verhindert starkes Zoomen, das sehbehinderte Nutzer benötigen. WCAG 1.4.4.',
    fix: 'maximum-scale entfernen oder auf mindestens 5 setzen, damit bis auf 500 % gezoomt werden kann.',
    effort: 'S',
    category: 'Farbe, Kontrast & Darstellung',
    norm: 'Best Practice (verwandt zu 1.4.4)'
  },
  'nested-interactive': {
    title: 'Interaktive Elemente ineinander verschachtelt',
    why: 'Ein Button/Link innerhalb eines anderen interaktiven Elements wird von Screenreadern oft gar nicht oder falsch angesagt und kann bei Tastaturbedienung zu Fokus-Problemen führen. WCAG 4.1.2.',
    fix: 'Interaktive Elemente nicht ineinander verschachteln — stattdessen nebeneinander anordnen oder per CSS getrennt gestalten.',
    effort: 'M',
    category: 'ARIA & Technik',
    norm: '4.1.2 (A)'
  },
  'no-autoplay-audio': {
    title: 'Automatisch startendes Audio/Video ohne Stopp-Möglichkeit',
    why: 'Länger als 3 Sekunden automatisch abspielender Ton ohne Stopp-/Stumm-Steuerung überlagert Screenreader-Ausgaben und stört viele Nutzer. WCAG 1.4.2.',
    fix: 'autoplay entfernen oder eine gut erreichbare Stopp-/Stummschalt-Steuerung direkt zu Beginn bereitstellen.',
    effort: 'M',
    category: 'Bilder & Medien',
    norm: '1.4.2 (A)'
  },
  'p-as-heading': {
    title: '<p> optisch wie eine Überschrift gestaltet',
    why: 'Fett/kursiv/groß formatierte Absätze, die visuell wie Überschriften wirken, werden von Screenreadern nicht als Überschrift angesagt — die Struktur der Seite geht verloren. WCAG 1.3.1.',
    fix: 'Echte Überschriften-Elemente (<h2>-<h6>) statt gestylter <p>-Tags verwenden.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: '1.3.1 (A)'
  },
  'presentation-role-conflict': {
    title: 'role="presentation"/"none" mit globalem ARIA-Attribut oder tabindex',
    why: 'Ein Element, das per role="presentation" aus der Barrierefreiheits-Struktur entfernt werden soll, aber noch ein globales ARIA-Attribut oder tabindex trägt, wird von manchen Screenreadern trotzdem angesagt.',
    fix: 'Zusätzliche ARIA-Attribute und tabindex vom Element entfernen oder die role="presentation" entfernen, falls das Element doch relevant ist.',
    effort: 'S',
    category: 'ARIA & Technik',
    norm: 'Best Practice'
  },
  'scope-attr-valid': {
    title: 'Ungültiges scope-Attribut in Tabelle',
    why: 'Ein falscher oder unpassender scope-Wert (z. B. scope="row" auf einer Datenzelle) führt zu einer falschen Spalten-/Zeilenzuordnung beim Vorlesen der Tabelle.',
    fix: 'scope nur an <th>-Elementen mit gültigem Wert ("row", "col", "rowgroup", "colgroup") setzen.',
    effort: 'S',
    category: 'Tabellen',
    norm: 'Best Practice'
  },
  'scrollable-region-focusable': {
    title: 'Scrollbarer Bereich nicht per Tastatur erreichbar',
    why: 'Ein Bereich mit eigenem Scrollbalken (z. B. Code-Block, Tabelle), der weder fokussierbare Kindelemente noch einen eigenen tabindex hat, kann von Tastatur-Nutzern nicht gescrollt werden. WCAG 2.1.1.',
    fix: 'tabindex="0" auf den scrollbaren Container setzen, damit er per Tab erreichbar und mit Pfeiltasten bedienbar ist.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '2.1.1 (A)'
  },
  'server-side-image-map': {
    title: 'Serverseitige Image-Map verwendet',
    why: 'Serverseitige Image-Maps (ismap) erfordern eine Maus-Koordinate und sind per Tastatur oder Screenreader nicht bedienbar. WCAG 2.1.1.',
    fix: 'Auf clientseitige Image-Map (<map>/<area> mit alt-Text) oder einzelne verlinkte Bilder/Buttons umstellen.',
    effort: 'M',
    category: 'Struktur & Navigation',
    norm: '2.1.1 (A)'
  },
  'skip-link': {
    title: 'Skip-Link ohne erreichbares Ziel',
    why: 'Ein "Zum Inhalt springen"-Link, dessen Sprungziel nicht existiert oder nicht fokussierbar ist, funktioniert für Tastatur-Nutzer nicht. WCAG 2.4.1.',
    fix: 'Sicherstellen, dass das Sprungziel (z. B. #main) existiert und fokussierbar ist (bei Bedarf tabindex="-1" am Zielelement).',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (verwandt zu 2.4.1)'
  },
  'summary-name': {
    title: '<summary>-Element ohne erkennbaren Text',
    why: 'Ein <summary> (Aufklapper eines <details>) ohne Text liefert Screenreadern keine Information darüber, was sich beim Öffnen zeigt. WCAG 4.1.2.',
    fix: 'Beschreibenden Text im <summary>-Element ergänzen.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '4.1.2 (A)'
  },
  'table-duplicate-name': {
    title: 'Tabellen-Caption wiederholt das summary-Attribut',
    why: 'Sind <caption> und summary-Attribut identisch, hören Screenreader-Nutzer dieselbe Information doppelt vorgelesen.',
    fix: 'summary-Attribut entfernen (veraltet) oder mit anderem, ergänzendem Inhalt als die <caption> befüllen.',
    effort: 'S',
    category: 'Tabellen',
    norm: 'Best Practice'
  },
  'table-fake-caption': {
    title: 'Tabellenüberschrift nicht als <caption> ausgezeichnet',
    why: 'Wird die Tabellenbeschreibung nur optisch (z. B. als <p> oder fette Zelle) über der Tabelle platziert, erkennt ein Screenreader sie nicht als Tabellentitel.',
    fix: 'Die Beschreibung in ein echtes <caption>-Element innerhalb der <table> verschieben.',
    effort: 'S',
    category: 'Tabellen',
    norm: '1.3.1 (A)'
  },
  'target-size': {
    title: 'Klick-/Touch-Ziel zu klein (WCAG 2.2)',
    why: 'Bedienelemente unter 24×24 CSS-Pixel mit zu wenig Abstand zu Nachbarelementen sind für Menschen mit motorischen Einschränkungen schwer präzise zu treffen. WCAG 2.5.8 (AA, neu in 2.2) — ausdrücklich im Scan-Umfang enthalten.',
    fix: 'Klickfläche auf mindestens 24×24 CSS-Pixel vergrößern (Padding statt nur Icon-Größe) oder ausreichend Abstand zu benachbarten Zielen einhalten.',
    effort: 'M',
    category: 'Farbe, Kontrast & Darstellung',
    norm: '2.5.8 (AA)'
  },
  'td-has-header': {
    title: 'Datenzelle in großer Tabelle ohne zugeordnete Kopfzelle',
    why: 'In Tabellen ab 4×4 Zellen ohne erkennbare th/headers-Zuordnung kann ein Screenreader die Spalten-/Zeilenbedeutung einer Datenzelle nicht ansagen.',
    fix: 'Passende <th scope="col"/"row"> ergänzen oder das headers-Attribut an den Datenzellen setzen.',
    effort: 'M',
    category: 'Tabellen',
    norm: '1.3.1 (A)'
  },
  'td-headers-attr': {
    title: 'headers-Attribut verweist auf falsche Zelle',
    why: 'Zeigt das headers-Attribut einer Zelle auf eine ID außerhalb derselben Tabelle oder eine nicht existierende ID, wird die Kopf-Zuordnung beim Vorlesen falsch oder übersprungen.',
    fix: 'headers-Werte auf die tatsächlichen IDs der zugehörigen <th>-Zellen in derselben Tabelle korrigieren.',
    effort: 'S',
    category: 'Tabellen',
    norm: '1.3.1 (A)'
  },
  'th-has-data-cells': {
    title: 'Tabellen-Kopfzelle ohne zugehörige Datenzellen',
    why: 'Ein <th>/role="columnheader"/"rowheader", dem keine Datenzelle zugeordnet ist, deutet auf eine kaputte Tabellenstruktur hin, die Screenreader-Nutzer verwirrt.',
    fix: 'Tabellenstruktur prüfen und sicherstellen, dass jede Kopfzelle mindestens eine zugehörige Datenzelle beschreibt.',
    effort: 'M',
    category: 'Tabellen',
    norm: '1.3.1 (A)'
  },
  'valid-lang': {
    title: 'Ungültiger lang-Attributwert',
    why: 'Ein lang-Attribut (z. B. an einem fremdsprachigen Textabschnitt) mit ungültigem Sprachcode führt zu falscher Aussprache durch den Screenreader.',
    fix: 'Gültigen BCP-47-Sprachcode verwenden (z. B. lang="en" für englische Textpassagen).',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: '3.1.2 (AA)'
  },
  'tabindex': {
    title: 'Positiver tabindex-Wert verwendet',
    why: 'tabindex-Werte größer als 0 erzwingen eine eigene Tab-Reihenfolge, die von der visuellen/logischen Reihenfolge abweicht und Tastatur-Nutzer verwirrt. WCAG 2.4.3.',
    fix: 'tabindex-Werte auf 0 oder -1 begrenzen und die Reihenfolge stattdessen über die DOM-Struktur steuern.',
    effort: 'S',
    category: 'Struktur & Navigation',
    norm: 'Best Practice (verwandt zu 2.4.3)'
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

// Kanonische Reihenfolge der Themen-Kategorien für die Report-Gliederung
// (report.js gruppiert Befunde/Checkliste danach). "Weitere Befunde" ist der
// Auffangkorb für (noch) nicht kategorisierte/unbekannte Regeln und steht
// bewusst am Ende.
export const CATEGORY_ORDER = [
  'Bilder & Medien',
  'Formulare & Eingabe',
  'Farbe, Kontrast & Darstellung',
  'Links, Schaltflächen & Bedienelemente',
  'Struktur & Navigation',
  'ARIA & Technik',
  'Tabellen',
  'Cookies & Tracking',
  'Weitere Befunde'
];

// Deutsche Klartexte für den Cookie-/Consent-Scan (§ 25 TDDDG).
export const COOKIE_RULES = {
  'tracker-before-consent': {
    title: 'Tracker-Request vor Einwilligung beobachtet',
    why: 'Es wurde eine Anfrage an einen Tracking-/Werbe-Host beobachtet, bevor eine Einwilligung vorlag. Hinweis: bei korrektem Consent Mode v2 kann diese Anfrage cookielos und zulässig sein — bitte verifizieren. Hartes Signal sind gesetzte Cookies (siehe ggf. separater Punkt).',
    fix: 'Sicherstellen, dass Tracking erst NACH aktiver Einwilligung lädt bzw. vorher nur cookielose Consent-Mode-Signale sendet.',
    effort: 'M',
    category: 'Cookies & Tracking',
    norm: '§ 25 TDDDG'
  },
  'cookie-before-consent': {
    title: 'Nicht-notwendige Cookies vor Einwilligung gesetzt',
    why: 'Es werden Cookies gesetzt, bevor eine Einwilligung vorliegt. § 25 TDDDG erlaubt das nur für technisch zwingend notwendige Cookies.',
    fix: 'Nicht-essenzielle Cookies erst nach Opt-in setzen; Consent-Tool davorschalten.',
    effort: 'M',
    category: 'Cookies & Tracking',
    norm: '§ 25 TDDDG'
  },
  'no-cookie-banner': {
    title: 'Kein Cookie-/Consent-Banner erkennbar',
    why: 'Es laden Tracker, aber es ist kein Einwilligungs-Banner auffindbar. Ohne Einwilligungsmöglichkeit ist nicht-notwendiges Tracking unzulässig.',
    fix: 'Ein TCF-2.2-konformes Consent-Banner mit gleichwertigem „Ablehnen" einbinden, das Tracking erst nach Zustimmung freigibt.',
    effort: 'M',
    category: 'Cookies & Tracking',
    norm: '§ 25 TDDDG'
  },
  'google-fonts-hotlink': {
    title: 'Google Fonts dynamisch eingebunden',
    why: 'Google Fonts werden direkt von Google-Servern geladen — dabei wird die IP-Adresse des Besuchers in die USA übertragen. In DE war das wiederholt Abmahn-Thema.',
    fix: 'Schriften lokal hosten (self-hosted) statt von fonts.googleapis.com/fonts.gstatic.com zu laden.',
    effort: 'S',
    category: 'Cookies & Tracking',
    norm: 'DSGVO Art. 44 ff.'
  },
  'us-transfer-before-consent': {
    title: 'US-Dienst vor Einwilligung kontaktiert',
    why: 'Ein Dienst mit US-Datenübermittlung wird vor Einwilligung geladen. Drittland-Transfer ohne Rechtsgrundlage/Consent ist datenschutzrechtlich riskant.',
    fix: 'US-Dienste erst nach Einwilligung laden oder EU-Alternative/Proxy nutzen.',
    effort: 'M',
    category: 'Cookies & Tracking',
    norm: 'DSGVO Art. 44 ff.'
  }
};

export function ruleInfo(violation) {
  const mapped = RULES_DE[violation.id] || COOKIE_RULES[violation.id];
  if (mapped) return { effort: 'M', category: 'Weitere Befunde', norm: 'Nicht klassifiziert', ...mapped };
  // Fallback für (noch) nicht übersetzte Regeln: deutscher generischer Text statt axe-Rohtext
  // in why/fix. Der axe-Originaltitel (violation.help) bleibt zur Einordnung als title erhalten.
  return {
    title: violation.help || violation.id,
    why: 'Automatisiert erkannter Verstoß gegen die WCAG-Richtlinien (axe-core-Regel „' + violation.id + '"). Diese Regel ist noch nicht im deutschen Regelwerk hinterlegt — sie kann die Bedienbarkeit für Menschen mit Behinderung einschränken.',
    fix: 'Für diese Regel liegt noch keine deutsche Lösungsbeschreibung vor. Technischen Detail-Hinweis von axe-core konsultieren: ' + (violation.helpUrl || 'keine Detail-URL verfügbar') + '.',
    effort: 'M',
    category: 'Weitere Befunde',
    norm: 'Automatisiert erkannt – keine feste Normzuordnung hinterlegt'
  };
}
