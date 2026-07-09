"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, ApiError } from "@/lib/api";

const MIN_LEN = 8;

export default function SetPasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tooShort = pw.length > 0 && pw.length < MIN_LEN;
  const mismatch = confirm.length > 0 && confirm !== pw;
  const canSubmit = pw.length >= MIN_LEN && confirm === pw && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      await auth.setPassword(pw);
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Sitzung abgelaufen. Bitte erneut anmelden.");
        router.replace("/login");
      } else {
        setError(
          err instanceof Error ? err.message : "Passwort konnte nicht gesetzt werden.",
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
          width={100}
          height={100}
          priority
          style={{ height: "auto", width: 100, objectFit: "contain" }}
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
            Passwort festlegen
          </h1>
          <p className="micro" style={{ marginTop: 6 }}>
            Wähle dein persönliches Login-Passwort. Der Zugangs-Token bleibt als
            Notfallzugang gültig.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="micro">Neues Passwort</span>
            <input
              className="input mono"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="mindestens 8 Zeichen"
              aria-label="Neues Passwort"
              minLength={MIN_LEN}
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="micro">Passwort bestätigen</span>
            <input
              className="input mono"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              aria-label="Passwort bestätigen"
              minLength={MIN_LEN}
              required
            />
          </label>

          {(tooShort || mismatch || error) && (
            <p
              role="alert"
              style={{ color: "var(--err)", fontSize: 13, margin: 0 }}
            >
              {error ??
                (tooShort
                  ? `Passwort muss mindestens ${MIN_LEN} Zeichen haben.`
                  : "Die Passwörter stimmen nicht überein.")}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
            style={{ width: "100%" }}
          >
            {loading ? "Speichere …" : "Passwort speichern"}
          </button>
        </form>

        <p className="micro" style={{ color: "var(--muted)", textAlign: "center" }}>
          Danach meldest du dich mit diesem Passwort an.
        </p>
      </div>
    </main>
  );
}
