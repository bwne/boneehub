"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ScriptEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  tags: string[];
  createdAt: number;
};

export default function HomePage() {
  const [scripts, setScripts] = useState<ScriptEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ScriptEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then(setScripts)
      .catch(() => setScripts([]));
  }, []);

  const filtered = useMemo(() => {
    if (!scripts) return [];
    const q = query.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [scripts, query]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures silently
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      {/* Hero */}
      <section className="mb-12 animate-rise">
        <div className="flex items-center gap-2 text-xs font-mono text-mint mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-mint animate-blink" />
          archive online · {scripts ? scripts.length : "…"} scripts
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Find your script,{" "}
          <span className="text-violet text-shadow">copy</span>,{" "}
          <span className="text-mint">run.</span>
        </h1>
        <p className="mt-4 text-muted max-w-xl">
          An archive of Roblox scripts shared by the community. Search by
          title, description, or tag.
        </p>

        <div className="mt-8 relative max-w-lg">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-violet">
            &gt;
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search scripts..."
            className="w-full h-12 rounded-lg bg-surface border border-line pl-9 pr-4 font-mono text-sm text-ink placeholder:text-muted/70 focus-ring focus:border-violet/60 transition-colors"
          />
        </div>
      </section>

      {/* Grid */}
      {scripts === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-20 text-center text-muted">
          {scripts.length === 0 ? (
            <>
              No scripts yet.{" "}
              <a href="/admin" className="text-violet underline underline-offset-2">
                Add one from the admin panel
              </a>
              .
            </>
          ) : (
            "No scripts match your search."
          )}
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="group text-left rounded-xl bg-surface border border-line overflow-hidden hover:border-violet/50 hover:shadow-glow transition-all focus-ring"
            >
              <div className="relative h-32 sm:h-40 bg-surface2 overflow-hidden">
                {s.imageUrl ? (
                  <Image
                    src={s.imageUrl}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-mono text-4xl text-line">
                    {"</>"}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold truncate">{s.title}</h3>
                <p className="mt-1 text-xs text-muted line-clamp-2">{s.description}</p>
                {s.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-mint/10 text-mint border border-mint/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Terminal-style code modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl overflow-hidden border border-line bg-[#0d0f16] shadow-glow animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-11 bg-surface2 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger/70" />
                <span className="h-3 w-3 rounded-full bg-mint/70" />
                <span className="h-3 w-3 rounded-full bg-violet/70" />
                <span className="ml-2 font-mono text-xs text-muted">{active.title}.lua</span>
              </div>
              <button
                onClick={() => setActive(null)}
                className="text-muted hover:text-ink focus-ring rounded px-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted mb-3">{active.description}</p>
              <pre className="max-h-72 overflow-auto rounded-lg bg-black/40 border border-line p-4 font-mono text-xs text-ink/90 whitespace-pre-wrap">
{active.code}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 pb-4">
              <button
                onClick={() => copyCode(active.code)}
                className="h-9 px-4 rounded-md bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors focus-ring"
              >
                {copied ? "Copied!" : "Copy script"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
