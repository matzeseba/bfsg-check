"use client";

import { useCallback, useEffect, useState } from "react";
import {
  libraryApi,
  type LibraryItem,
  type LibraryItemDetail,
  type LibraryCategory,
  type LibraryInput,
} from "@/lib/api";
import { Drawer } from "@/components/ui/Drawer";
import { Markdown } from "@/components/ui/Markdown";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Loading, ErrorNote, Empty } from "@/components/ui/States";
import { dateShort } from "@/lib/format";

const CATEGORIES: { value: LibraryCategory; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "case-study", label: "Case-Study" },
  { value: "audit-template", label: "Audit-Vorlage" },
  { value: "sonstiges", label: "Sonstiges" },
];

function categoryLabel(cat: string): string {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

const EMPTY_FORM: LibraryInput = {
  title: "",
  category: "sonstiges",
  tags: [],
  body_md: "",
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<LibraryItemDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LibraryInput>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryApi.list({
        q: q || undefined,
        category: category || undefined,
      });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bibliothek nicht ladbar.");
    } finally {
      setLoading(false);
    }
  }, [q, category]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250); // Debounce fuer Suche
    return () => clearTimeout(t);
  }, [load]);

  async function openPreview(id: number) {
    setPreviewLoading(true);
    setCopied(false);
    try {
      const detail = await libraryApi.get(id);
      setPreview(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vorschau nicht ladbar.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function copyBody() {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.body_md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopieren nicht möglich (Zwischenablage gesperrt).");
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTagsInput("");
    setEditorOpen(true);
  }

  async function openEdit(id: number) {
    setPreviewLoading(true);
    try {
      const detail = await libraryApi.get(id);
      setEditingId(detail.id);
      setForm({
        title: detail.title,
        category: detail.category,
        tags: detail.tags,
        body_md: detail.body_md,
      });
      setTagsInput(detail.tags.join(", "));
      setPreview(null);
      setEditorOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Datensatz nicht ladbar.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: LibraryInput = {
      ...form,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editingId != null) {
        await libraryApi.update(editingId, payload);
      } else {
        await libraryApi.create(payload);
      }
      setEditorOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 220 }}>
          <span className="micro">Suche</span>
          <div style={{ position: "relative" }}>
            <span
              style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }}
              aria-hidden="true"
            >
              <Icon name="search" size={16} />
            </span>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Titel, Text oder Tag …"
              aria-label="Bibliothek durchsuchen"
              style={{ paddingLeft: 34 }}
            />
          </div>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="micro">Kategorie</span>
          <select
            className="input mono"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">Alle</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          <Icon name="plus" size={16} />
          Neu
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <ErrorNote message={error} />
        </div>
      )}

      {loading ? (
        <Loading label="Lade Bibliothek …" />
      ) : items.length === 0 ? (
        <Empty>Keine Einträge. Lege mit „Neu" den ersten an.</Empty>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {items.map((it) => (
            <article
              key={it.id}
              className="panel"
              style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <Badge tone="neutral">{categoryLabel(it.category)}</Badge>
                <span className="micro" style={{ color: "var(--muted)" }}>
                  {dateShort(it.updated_at)}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{it.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", flex: 1 }}>
                {it.preview}
              </p>
              {it.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {it.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="mono"
                      style={{ fontSize: 11, color: "var(--muted)" }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void openPreview(it.id)}
                  style={{ flex: 1, padding: "6px 10px" }}
                >
                  <Icon name="book" size={15} />
                  Vorschau
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void openEdit(it.id)}
                  aria-label={`${it.title} bearbeiten`}
                  style={{ padding: "6px 10px" }}
                >
                  Bearbeiten
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Vorschau-Drawer */}
      <Drawer
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? "Vorschau"}
        width={640}
      >
        {previewLoading || !preview ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Badge tone="neutral">{categoryLabel(preview.category)}</Badge>
              <span className="micro" style={{ color: "var(--muted)" }}>
                aktualisiert {dateShort(preview.updated_at)}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => void copyBody()}
                style={{ marginLeft: "auto", padding: "6px 12px" }}
              >
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <div className="panel" style={{ padding: 16 }}>
              <Markdown source={preview.body_md} />
            </div>
          </div>
        )}
      </Drawer>

      {/* Editor-Drawer */}
      <Drawer
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId != null ? "Eintrag bearbeiten" : "Neuer Eintrag"}
        width={640}
      >
        <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="micro">Titel</span>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="micro">Kategorie</span>
            <select
              className="input mono"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as LibraryCategory })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="micro">Tags (kommagetrennt)</span>
            <input
              className="input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="wcag, bfsg, checkliste"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="micro">Inhalt (Markdown)</span>
            <textarea
              className="input mono"
              value={form.body_md}
              onChange={(e) => setForm({ ...form, body_md: e.target.value })}
              rows={14}
              style={{ resize: "vertical", lineHeight: 1.5 }}
              required
            />
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn" onClick={() => setEditorOpen(false)}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={16} />
              {saving ? "Speichere …" : "Speichern"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
