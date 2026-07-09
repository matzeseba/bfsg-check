"use client";

/**
 * Web-Speech-API-Hook (Team Gamma, Spec §5).
 * - Spracherkennung: SpeechRecognition / webkitSpeechRecognition, lang de-DE,
 *   interimResults live. Feature-Detection -> ohne Support deaktiviert.
 * - Sprachausgabe: speechSynthesis mit bevorzugt deutscher Stimme.
 *
 * Die Standard-DOM-Typen kennen SpeechRecognition nicht -> minimale eigene Typen.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

function getRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export interface UseSpeech {
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  listening: boolean;
  start: (onFinal: (text: string) => void, onInterim: (text: string) => void) => void;
  stop: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  cancelSpeak: () => void;
}

export function useSpeech(): UseSpeech {
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const germanVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Feature-Detection + deutsche Stimme laden (Voices kommen teils asynchron).
  useEffect(() => {
    setRecognitionSupported(getRecognitionCtor() !== undefined);

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    setSynthesisSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      germanVoiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith("de")) ?? null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* bereits gestoppt */
      }
    }
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void, onInterim: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;

      // Laufende Erkennung zuerst beenden.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* egal */
        }
      }

      const rec = new Ctor();
      rec.lang = "de-DE";
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let interim = "";
        let didFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript ?? "";
          if (res.isFinal) {
            const finalText = transcript.trim();
            if (finalText) {
              onFinal(finalText);
              didFinal = true;
            }
          } else {
            interim += transcript;
          }
        }
        if (!didFinal) onInterim(interim);
      };
      rec.onerror = () => {
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
      };

      recognitionRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    [],
  );

  const cancelSpeak = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(trimmed);
    utter.lang = "de-DE";
    if (germanVoiceRef.current) utter.voice = germanVoiceRef.current;
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
  }, []);

  return {
    recognitionSupported,
    synthesisSupported,
    listening,
    start,
    stop,
    speak,
    cancelSpeak,
  };
}
