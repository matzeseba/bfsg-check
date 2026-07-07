import { type ReactNode } from 'react';

// Minimaler Markdown-Renderer — bewusst OHNE zusätzliche Dependency.
// Unterstützt: Überschriften (#..######), Listen (-/* und 1.), Zitate (>),
// Code-Blöcke (```), sowie inline **fett**, `code` und [Text](URL).

let keySeq = 0;
function nextKey(prefix: string): string {
  keySeq += 1;
  return `${prefix}-${keySeq}`;
}

const INLINE = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      nodes.push(<strong key={nextKey('b')}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(
        <code key={nextKey('c')} className="md-inline-code">
          {match[3]}
        </code>,
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      nodes.push(
        <a key={nextKey('a')} href={match[5]} target="_blank" rel="noreferrer noopener">
          {match[4]}
        </a>,
      );
    }
    lastIndex = INLINE.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

type Heading = 'h1' | 'h2' | 'h3' | 'h4';

export function Markdown({ content }: { content: string }): ReactNode {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let i = 0;

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      blocks.push(<p key={nextKey('p')}>{renderInline(paragraph.join(' '))}</p>);
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const raw = lines[i] ?? '';
    const line = raw.trim();

    if (line === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    // Code-Block
    if (line.startsWith('```')) {
      flushParagraph();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        code.push(lines[i] ?? '');
        i += 1;
      }
      i += 1; // schließendes ```
      blocks.push(
        <pre key={nextKey('pre')} className="md-code-block">
          <code>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Überschrift
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1]?.length ?? 1, 4);
      const Tag = `h${level}` as Heading;
      blocks.push(
        <Tag key={nextKey('h')} className="md-heading">
          {renderInline(heading[2] ?? '')}
        </Tag>,
      );
      i += 1;
      continue;
    }

    // Zitat
    if (line.startsWith('> ')) {
      flushParagraph();
      const quote: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('> ')) {
        quote.push((lines[i] ?? '').trim().slice(2));
        i += 1;
      }
      blocks.push(
        <blockquote key={nextKey('q')} className="md-quote">
          {renderInline(quote.join(' '))}
        </blockquote>,
      );
      continue;
    }

    // Ungeordnete Liste
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={nextKey('ul')} className="md-list">
          {items.map((item) => (
            <li key={nextKey('li')}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Geordnete Liste
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={nextKey('ol')} className="md-list">
          {items.map((item) => (
            <li key={nextKey('li')}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Absatz
    paragraph.push(line);
    i += 1;
  }
  flushParagraph();

  return <div className="md">{blocks}</div>;
}
