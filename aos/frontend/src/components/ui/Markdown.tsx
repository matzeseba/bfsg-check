import type { JSX, ReactNode } from "react";

/**
 * Minimaler, abhaengigkeitsfreier Markdown-Renderer.
 * Unterstuetzt: Ueberschriften (#..######), Listen (-, *, 1.), Blockquotes (>),
 * Code-Bloecke (```), horizontale Linien (---), Absaetze und Inline-Formatierung
 * (**fett**, *kursiv*, `code`, [Text](url)).
 *
 * Bewusst kein dangerouslySetInnerHTML: Inline wird zu React-Nodes geparst,
 * daher kein HTML-Injection-Risiko aus Asset-Inhalten.
 */

let keySeq = 0;
function nextKey(prefix: string): string {
  keySeq += 1;
  return `${prefix}-${keySeq}`;
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Reihenfolge: Links, dann fett, kursiv, code.
  const pattern =
    /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("[")) {
      const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (m) {
        const href = m[2];
        const safe = /^(https?:|mailto:|\/)/i.test(href) ? href : "#";
        nodes.push(
          <a
            key={nextKey("a")}
            href={safe}
            target={safe.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            {m[1]}
          </a>,
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={nextKey("b")}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={nextKey("i")}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={nextKey("c")}
          style={{
            fontFamily: "var(--mono)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: "0.9em",
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  keySeq = 0;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: JSX.Element[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code-Block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // schliessendes ```
      blocks.push(
        <pre
          key={nextKey("pre")}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 12,
            overflowX: "auto",
            fontFamily: "var(--mono)",
            fontSize: 13,
          }}
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Horizontale Linie
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(
        <hr
          key={nextKey("hr")}
          style={{ border: 0, borderTop: "1px solid var(--border)", margin: "12px 0" }}
        />,
      );
      i += 1;
      continue;
    }

    // Ueberschrift
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const sizes = [22, 19, 17, 15, 14, 13];
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag
          key={nextKey("h")}
          style={{
            fontSize: sizes[level - 1],
            fontWeight: 700,
            margin: "16px 0 8px",
            lineHeight: 1.25,
          }}
        >
          {parseInline(h[2])}
        </Tag>,
      );
      i += 1;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={nextKey("q")}
          style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: 12,
            margin: "8px 0",
            color: "var(--muted)",
          }}
        >
          {parseInline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // Listen (ungeordnet / geordnet)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i += 1;
      }
      const inner = items.map((it) => (
        <li key={nextKey("li")} style={{ margin: "3px 0" }}>
          {parseInline(it)}
        </li>
      ));
      blocks.push(
        ordered ? (
          <ol key={nextKey("ol")} style={{ paddingLeft: 22, margin: "8px 0" }}>
            {inner}
          </ol>
        ) : (
          <ul key={nextKey("ul")} style={{ paddingLeft: 22, margin: "8px 0" }}>
            {inner}
          </ul>
        ),
      );
      continue;
    }

    // Leerzeile
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // Absatz (bis zur naechsten Leerzeile)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^\s*(#{1,6}\s|>|```|[-*]\s|\d+\.\s)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={nextKey("p")} style={{ margin: "8px 0" }}>
        {parseInline(para.join(" "))}
      </p>,
    );
  }

  return (
    <div style={{ lineHeight: 1.6, wordBreak: "break-word" }}>{blocks}</div>
  );
}
