"use client";

/**
 * WebSocket-Verbindung zu /ws/jarvis (Team Gamma, Spec §5).
 * - same-origin ws(s):// (Caddy proxyt /ws/* an aos-backend)
 * - Auto-Reconnect mit exponentiellem Backoff (1s -> max 15s)
 * - Auth laeuft ueber das aos_session-Cookie (wird beim Upgrade mitgesendet)
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface JarvisFrame {
  type: "assistant_delta" | "ui_action" | "done" | "error";
  text?: string;
  full_text?: string;
  action?: "navigate" | "run_agent";
  params?: { route?: string; key?: string };
  detail?: string;
}

export interface OutgoingUserText {
  type: "user_text";
  text: string;
  context: { route: string; screen_summary: string };
}
export interface OutgoingCancel {
  type: "cancel";
}
export type OutgoingMessage = OutgoingUserText | OutgoingCancel;

const BACKOFF_START_MS = 1000;
const BACKOFF_MAX_MS = 15000;

function socketUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/jarvis`;
}

export interface UseJarvisSocket {
  connected: boolean;
  send: (message: OutgoingMessage) => boolean;
}

export function useJarvisSocket(
  onFrame: (frame: JarvisFrame) => void,
): UseJarvisSocket {
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const onFrameRef = useRef(onFrame);
  const backoffRef = useRef(BACKOFF_START_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUnmountRef = useRef(false);

  // Frame-Handler in einer Ref halten -> Reconnect nicht an Callback-Identitaet koppeln.
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(socketUrl());
    } catch {
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      backoffRef.current = BACKOFF_START_MS;
      setConnected(true);
    };
    ws.onmessage = (event: MessageEvent) => {
      try {
        const frame = JSON.parse(event.data as string) as JarvisFrame;
        onFrameRef.current(frame);
      } catch {
        /* nicht-JSON ignorieren */
      }
    };
    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      if (!closedByUnmountRef.current) scheduleReconnect();
    };
    ws.onerror = () => {
      // onclose folgt und uebernimmt den Reconnect.
      try {
        ws.close();
      } catch {
        /* egal */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    const delay = backoffRef.current;
    backoffRef.current = Math.min(delay * 2, BACKOFF_MAX_MS);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  useEffect(() => {
    closedByUnmountRef.current = false;
    connect();
    return () => {
      closedByUnmountRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* egal */
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((message: OutgoingMessage): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(message));
    return true;
  }, []);

  return { connected, send };
}
