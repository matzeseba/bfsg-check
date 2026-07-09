"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(token.trim());
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Token ungültig. Bitte prüfen und erneut versuchen.");
      } else {
        setError(
          err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 50% -10%, #141416 0%, var(--bg) 60%)",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Image
          src="/brand/bfsg-fuchs-mascot-final.png"
          alt="BFSG-Fuchs Maskottchen"
          width={140}
          height={140}
          priority
          style={{ height: "auto", width: 140, objectFit: "contain" }}
        />

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            AOS-Dashboard
          </h1>
          <p className="micro" style={{ marginTop: 6 }}>
            Betriebssystem des BFSG-Fuchs
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="micro">Zugangs-Token</span>
            <input
              className="input mono"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••••••"
              aria-label="Zugangs-Token"
              required
            />
          </label>

          {error && (
            <p
              role="alert"
              style={{ color: "var(--err)", fontSize: 13, margin: 0 }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || token.trim() === ""}
            style={{ width: "100%" }}
          >
            {loading ? "Prüfe …" : "Anmelden"}
          </button>
        </form>

        <p className="micro" style={{ color: "var(--muted)", textAlign: "center" }}>
          Geschützter Bereich · nur für den Betreiber
        </p>
      </div>
    </main>
  );
}
