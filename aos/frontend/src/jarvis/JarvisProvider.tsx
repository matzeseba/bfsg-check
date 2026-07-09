"use client";

/**
 * JarvisProvider (Team Gamma, Spec §5).
 * Haelt WS-Verbindung, Nachrichtenliste, Status (idle/listening/thinking/speaking),
 * Voice-Ein-/Ausgabe und Kontext-Awareness (usePathname -> route + screen_summary).
 * Verarbeitet ui_action-Frames: navigate -> router.push, run_agent -> POST + Toast.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { agentsApi } from "@/lib/api";
import {
  useJarvisSocket,
  type JarvisFrame,
  type OutgoingUserText,
} from "./useJarvisSocket";
import { useSpeech } from "./useSpeech";

export type JarvisRole = "user" | "assistant";
export interface ChatMessage {
  role: JarvisRole;
  text: string;
}
export type JarvisStatus = "idle" | "listening" | "thinking" | "speaking";

const VOICE_REPLY_MAX_CHARS = 300;

/** Route -> deutsche Kurzbeschreibung (screen_summary fuer Kontext-Awareness). */
const SCREEN_SUMMARIES: Record<string, string> = {
  "/": "Dashboard-Übersicht mit KPIs (Umsatz, offene Anfragen, Leads, System-Status)",
  "/inbox": "Posteingang mit Kundenanfragen, nach KI-Priorität sortiert",
  "/library": "Content-Bibliothek (LinkedIn-Entwürfe, Fallstudien, Audit-Vorlagen)",
  "/health": "System- und Service-Status (Scan-Engine, Landing, Admin, Agenten)",
  "/finance": "Finanzen: Umsatz, MRR, Abos, Kleinunternehmer-Grenzen",
  "/agents": "KI-Agenten-Steuerung (Research, Lead-Scoring, Wettbewerb, Debrief)",
};

function summaryForRoute(pathname: string): string {
  if (SCREEN_SUMMARIES[pathname]) return SCREEN_SUMMARIES[pathname];
  const key = Object.keys(SCREEN_SUMMARIES).find(
    (k) => k !== "/" && pathname.startsWith(k),
  );
  return key ? SCREEN_SUMMARIES[key] : "Unbekannte Ansicht";
}

export interface JarvisContextValue {
  open: boolean;
  toggleOpen: () => void;
  close: () => void;
  connected: boolean;
  status: JarvisStatus;
  messages: ChatMessage[];
  interim: string;
  toast: string | null;
  sendText: (text: string) => void;
  cancel: () => void;
  micOn: boolean;
  toggleMic: () => void;
  micSupported: boolean;
  voiceReply: boolean;
  toggleVoiceReply: () => void;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export function useJarvis(): JarvisContextValue {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis muss innerhalb von <JarvisProvider> genutzt werden.");
  return ctx;
}

export function JarvisProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<JarvisStatus>("idle");
  const [interim, setInterim] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [voiceReply, setVoiceReply] = useState(false);

  const streamingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speech = useSpeech();
  const voiceReplyRef = useRef(voiceReply);
  useEffect(() => {
    voiceReplyRef.current = voiceReply;
  }, [voiceReply]);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const appendAssistantDelta = useCallback((delta: string) => {
    setMessages((prev) => {
      if (streamingRef.current && prev.length > 0 && prev[prev.length - 1].role === "assistant") {
        const next = prev.slice();
        next[next.length - 1] = {
          role: "assistant",
          text: next[next.length - 1].text + delta,
        };
        return next;
      }
      streamingRef.current = true;
      return [...prev, { role: "assistant", text: delta }];
    });
  }, []);

  const finalizeAssistant = useCallback((fullText: string) => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
        const next = prev.slice();
        next[next.length - 1] = { role: "assistant", text: fullText || next[next.length - 1].text };
        return next;
      }
      if (fullText) return [...prev, { role: "assistant", text: fullText }];
      return prev;
    });
  }, []);

  const handleUiAction = useCallback(
    (frame: JarvisFrame) => {
      if (frame.action === "navigate") {
        const route = frame.params?.route;
        if (route) router.push(route);
        return;
      }
      if (frame.action === "run_agent") {
        const key = frame.params?.key;
        if (!key) return;
        showToast(`Agent „${key}" wird gestartet …`);
        agentsApi
          .run(key)
          .then(() => showToast(`Agent „${key}" gestartet.`))
          .catch(() => showToast(`Agent „${key}" konnte nicht gestartet werden.`));
        router.push("/agents");
      }
    },
    [router, showToast],
  );

  const handleFrame = useCallback(
    (frame: JarvisFrame) => {
      switch (frame.type) {
        case "assistant_delta":
          if (frame.text) appendAssistantDelta(frame.text);
          break;
        case "ui_action":
          handleUiAction(frame);
          break;
        case "done": {
          streamingRef.current = false;
          const full = frame.full_text ?? "";
          finalizeAssistant(full);
          if (voiceReplyRef.current && full) {
            setStatus("speaking");
            speech.speak(full.slice(0, VOICE_REPLY_MAX_CHARS), () => setStatus("idle"));
          } else {
            setStatus("idle");
          }
          break;
        }
        case "error":
          streamingRef.current = false;
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: frame.detail || "Es ist ein Fehler aufgetreten." },
          ]);
          setStatus("idle");
          break;
      }
    },
    [appendAssistantDelta, finalizeAssistant, handleUiAction, speech],
  );

  const { connected, send } = useJarvisSocket(handleFrame);

  const sendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      streamingRef.current = false;
      const payload: OutgoingUserText = {
        type: "user_text",
        text: trimmed,
        context: { route: pathname, screen_summary: summaryForRoute(pathname) },
      };
      const ok = send(payload);
      if (ok) {
        setStatus("thinking");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Jarvis ist gerade nicht verbunden. Bitte kurz warten." },
        ]);
        setStatus("idle");
      }
    },
    [pathname, send],
  );

  const cancel = useCallback(() => {
    send({ type: "cancel" });
    streamingRef.current = false;
    speech.cancelSpeak();
    setStatus("idle");
  }, [send, speech]);

  const stopMic = useCallback(() => {
    speech.stop();
    setMicOn(false);
    setInterim("");
    if (status === "listening") setStatus("idle");
  }, [speech, status]);

  const toggleMic = useCallback(() => {
    if (!speech.recognitionSupported) return;
    if (micOn) {
      stopMic();
      return;
    }
    setMicOn(true);
    setStatus("listening");
    speech.start(
      (finalText) => {
        setInterim("");
        setMicOn(false);
        sendText(finalText);
      },
      (interimText) => setInterim(interimText),
    );
  }, [micOn, speech, sendText, stopMic]);

  const toggleVoiceReply = useCallback(() => {
    setVoiceReply((prev) => {
      if (prev) speech.cancelSpeak();
      return !prev;
    });
  }, [speech]);

  const close = useCallback(() => setOpen(false), []);
  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  // Tastatur: Strg/Cmd+K oeffnet/schliesst, ESC schliesst.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen((prev) => (prev ? false : prev));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const value = useMemo<JarvisContextValue>(
    () => ({
      open,
      toggleOpen,
      close,
      connected,
      status,
      messages,
      interim,
      toast,
      sendText,
      cancel,
      micOn,
      toggleMic,
      micSupported: speech.recognitionSupported,
      voiceReply,
      toggleVoiceReply,
    }),
    [
      open,
      toggleOpen,
      close,
      connected,
      status,
      messages,
      interim,
      toast,
      sendText,
      cancel,
      micOn,
      toggleMic,
      speech.recognitionSupported,
      voiceReply,
      toggleVoiceReply,
    ],
  );

  return <JarvisContext.Provider value={value}>{children}</JarvisContext.Provider>;
}
