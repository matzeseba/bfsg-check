"use client";

/**
 * JarvisOverlay (Team Gamma, Spec §3/§5).
 * Floating-Action-Button (Fuchs-Avatar in gelbem Kreis, Puls bei listening) +
 * Panel (Chat-Verlauf, Texteingabe, Mic-Toggle, Voice-Antwort-Toggle).
 * Brutalistisch: surface, 2px Border, Signalgelb-Akzente.
 */

import { useEffect, useRef, useState } from "react";
import { useJarvis, type JarvisStatus } from "./JarvisProvider";

const MASCOT_SRC = "/brand/bfsg-fuchs-mascot-final.png";

const STATUS_LABEL: Record<JarvisStatus, string> = {
  idle: "Bereit",
  listening: "Hoere zu …",
  thinking: "Denkt nach …",
  speaking: "Spricht …",
};

/** Scoped Keyframes (kein Edit an globals.css noetig). */
function JarvisStyles() {
  return (
    <style>{`
      @keyframes jarvis-pulse {
        0% { box-shadow: 0 0 0 0 rgba(255,214,0,0.55); }
        70% { box-shadow: 0 0 0 14px rgba(255,214,0,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,214,0,0); }
      }
      @keyframes jarvis-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      .jarvis-fab-listening { animation: jarvis-pulse 1.4s infinite; }
      .jarvis-typing::after { content: "▍"; animation: jarvis-blink 1s steps(1) infinite; }
    `}</style>
  );
}

export function JarvisOverlay() {
  const j = useJarvis();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-Scroll ans Ende bei neuen Nachrichten / Interim.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [j.messages, j.interim, j.status]);

  // Fokus ins Eingabefeld beim Oeffnen.
  useEffect(() => {
    if (j.open) inputRef.current?.focus();
  }, [j.open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    j.sendText(text);
    setDraft("");
  }

  const busy = j.status === "thinking" || j.status === "speaking";

  return (
    <>
      <JarvisStyles />

      {/* Floating-Action-Button */}
      <button
        type="button"
        onClick={j.toggleOpen}
        aria-label={j.open ? "Jarvis schließen" : "Jarvis öffnen (Strg+K)"}
        aria-expanded={j.open}
        title="Jarvis (Strg+K)"
        className={j.status === "listening" ? "jarvis-fab-listening" : undefined}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 60,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "var(--accent)",
          border: "2px solid var(--accent)",
          padding: 0,
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MASCOT_SRC}
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "50%" }}
        />
      </button>

      {!j.open ? null : (
        <section
          role="dialog"
          aria-label="Jarvis — Sprachassistent"
          aria-modal="false"
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            zIndex: 60,
            width: "min(380px, calc(100vw - 48px))",
            height: "min(560px, calc(100vh - 140px))",
            display: "flex",
            flexDirection: "column",
            background: "var(--surface)",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          }}
        >
          {/* Kopf */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "10px 14px",
              borderBottom: "2px solid var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: j.connected ? "var(--ok)" : "var(--err)",
                  flex: "0 0 auto",
                }}
              />
              <strong style={{ fontSize: 14 }}>Jarvis</strong>
              <span className="micro" style={{ color: "var(--muted)" }}>
                {j.connected ? STATUS_LABEL[j.status] : "Getrennt"}
              </span>
            </div>
            <button
              type="button"
              className="btn"
              onClick={j.close}
              aria-label="Schliessen"
              style={{ padding: "4px 10px" }}
            >
              ESC
            </button>
          </header>

          {/* Verlauf */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
          >
            {j.messages.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Frag mich etwas oder sag „öffne den Posteingang“. Mit Strg+K öffnest und
                schließt du dieses Fenster.
              </p>
            )}
            {j.messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                text={m.text}
                typing={
                  m.role === "assistant" &&
                  i === j.messages.length - 1 &&
                  j.status === "thinking"
                }
              />
            ))}
            {j.status === "thinking" &&
              (j.messages.length === 0 ||
                j.messages[j.messages.length - 1].role === "user") && (
                <MessageBubble role="assistant" text="" typing />
              )}
            {j.interim && (
              <MessageBubble role="user" text={j.interim} muted />
            )}
          </div>

          {/* Toast */}
          {j.toast && (
            <div
              role="status"
              style={{
                margin: "0 14px 8px",
                padding: "8px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius)",
                fontSize: 12,
                color: "var(--text)",
              }}
            >
              {j.toast}
            </div>
          )}

          {/* Eingabe */}
          <form
            onSubmit={submit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderTop: "2px solid var(--border)",
            }}
          >
            <button
              type="button"
              className="btn"
              onClick={j.toggleMic}
              disabled={!j.micSupported}
              aria-pressed={j.micOn}
              aria-label={
                j.micSupported
                  ? j.micOn
                    ? "Mikrofon stoppen"
                    : "Mikrofon starten"
                  : "Spracherkennung wird von diesem Browser nicht unterstuetzt"
              }
              title={
                j.micSupported
                  ? "Spracheingabe (de-DE)"
                  : "Spracherkennung wird von diesem Browser nicht unterstuetzt"
              }
              style={{
                padding: "8px 10px",
                background: j.micOn ? "var(--accent)" : "var(--surface-2)",
                color: j.micOn ? "var(--accent-ink)" : "var(--text)",
                borderColor: j.micOn ? "var(--accent)" : "var(--border)",
              }}
            >
              {j.micOn ? "● Mic" : "○ Mic"}
            </button>

            <input
              ref={inputRef}
              className="input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nachricht an Jarvis …"
              aria-label="Nachricht an Jarvis"
              style={{ flex: 1 }}
            />

            {busy ? (
              <button
                type="button"
                className="btn"
                onClick={j.cancel}
                aria-label="Antwort abbrechen"
                style={{ padding: "8px 12px" }}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!draft.trim()}
                aria-label="Senden"
                style={{ padding: "8px 12px" }}
              >
                Senden
              </button>
            )}
          </form>

          {/* Voice-Antwort-Toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px 12px",
              fontSize: 12,
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={j.voiceReply}
              onChange={j.toggleVoiceReply}
              aria-label="Antworten vorlesen"
            />
            Antworten vorlesen (Sprachausgabe)
          </label>
        </section>
      )}
    </>
  );
}

function MessageBubble({
  role,
  text,
  typing = false,
  muted = false,
}: {
  role: "user" | "assistant";
  text: string;
  typing?: boolean;
  muted?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
        background: isUser ? "var(--accent)" : "var(--surface-2)",
        color: isUser ? "var(--accent-ink)" : "var(--text)",
        border: `1px solid ${isUser ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "8px 11px",
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        opacity: muted ? 0.6 : 1,
      }}
    >
      <span className={typing ? "jarvis-typing" : undefined}>{text}</span>
    </div>
  );
}
