"use client";

import { useEffect, useState } from "react";

type ScriptEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  tags: string[];
  createdAt: number;
};

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [scripts, setScripts] = useState<ScriptEntry[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    code: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (authed) refreshScripts();
  }, [authed]);

  async function refreshScripts() {
    const r = await fetch("/api/scripts");
    setScripts(await r.json());
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setLoginError(d.error || "Login failed");
        return;
      }
      setAuthed(true);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setAuthed(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const r = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setFormError(d.error || "Could not save");
        return;
      }
      setForm({ title: "", description: "", imageUrl: "", code: "", tags: "" });
      refreshScripts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    refreshScripts();
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-muted">
        loading…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <div className="rounded-xl border border-line bg-surface p-6 animate-rise">
          <div className="font-mono text-xs text-violet mb-2">$ admin --login</div>
          <h1 className="font-display text-xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 rounded-lg bg-surface2 border border-line px-3 font-mono text-sm focus-ring focus:border-violet/60"
            />
            {loginError && <p className="text-sm text-danger">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 rounded-lg bg-violet text-white font-medium hover:bg-violet/90 transition-colors disabled:opacity-60 focus-ring"
            >
              {loggingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-danger transition-colors focus-ring rounded px-2 py-1"
        >
          Sign out
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-xl border border-line bg-surface p-6 space-y-4 mb-10"
      >
        <h2 className="font-display font-semibold text-lg">Add a new script</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="h-11 rounded-lg bg-surface2 border border-line px-3 text-sm focus-ring focus:border-violet/60"
          />
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="Image URL (optional)"
            className="h-11 rounded-lg bg-surface2 border border-line px-3 text-sm focus-ring focus:border-violet/60"
          />
        </div>

        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm focus-ring focus:border-violet/60"
        />

        <textarea
          required
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="Script code"
          rows={6}
          className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 font-mono text-xs focus-ring focus:border-violet/60"
        />

        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="Tags (comma separated, e.g. updated, tested)"
          className="w-full h-11 rounded-lg bg-surface2 border border-line px-3 text-sm focus-ring focus:border-violet/60"
        />

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          className="h-11 px-6 rounded-lg bg-violet text-white font-medium hover:bg-violet/90 transition-colors disabled:opacity-60 focus-ring"
        >
          {saving ? "Saving…" : "Add script"}
        </button>
      </form>

      <h2 className="font-display font-semibold text-lg mb-4">
        Existing scripts ({scripts.length})
      </h2>
      <div className="space-y-2">
        {scripts.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{s.title}</p>
              <p className="text-xs text-muted truncate">{s.description}</p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="ml-4 shrink-0 text-sm text-danger hover:underline focus-ring rounded px-2 py-1"
            >
              Delete
            </button>
          </div>
        ))}
        {scripts.length === 0 && (
          <p className="text-sm text-muted">No scripts yet.</p>
        )}
      </div>
    </div>
  );
}
