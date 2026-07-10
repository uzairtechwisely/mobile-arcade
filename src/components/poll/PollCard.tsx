"use client";

import { useEffect, useMemo, useState } from "react";

type PollData = {
  slug: string;
  question: string;
  options: Array<{ key: string; label: string }>;
};

export function PollCard() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "voting" | "error">(
    "loading",
  );

  useEffect(() => {
    fetch("/api/polls/active")
      .then((r) => r.json())
      .then((j) => {
        setPoll(j.poll);
        setCounts(j.counts ?? {});
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  const total = useMemo(() => {
    if (!poll) return 0;
    return poll.options.reduce((acc, o) => acc + (counts[o.key] ?? 0), 0);
  }, [counts, poll]);

  const vote = async () => {
    if (!poll || !selected) return;
    setStatus("voting");
    const res = await fetch(`/api/polls/${poll.slug}/votes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ optionKey: selected }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setStatus("error");
      return;
    }

    const next = await fetch("/api/polls/active")
      .then((r) => r.json())
      .catch(() => null);
    if (next?.counts) setCounts(next.counts);
    setStatus("idle");
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <div className="text-sm font-semibold">Community poll</div>
      <div className="mt-2 text-sm text-muted">
        Help us choose what we build next.
      </div>

      {!poll ? (
        <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-muted">
          {status === "error" ? "Poll unavailable right now." : "Loading poll…"}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="text-base font-semibold leading-6">{poll.question}</div>

          <div className="space-y-2">
            {poll.options.map((o) => {
              const isActive = selected === o.key;
              const c = counts[o.key] ?? 0;
              const pct = total ? Math.round((c / total) * 100) : 0;

              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setSelected(o.key)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{o.label}</div>
                    <div
                      className={`text-xs font-semibold ${
                        isActive ? "text-background/80" : "text-muted"
                      }`}
                    >
                      {pct}% · {c} votes
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selected || status === "voting"}
            onClick={vote}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-background transition hover:brightness-95 disabled:opacity-60"
          >
            {status === "voting" ? "Submitting…" : "Submit vote"}
          </button>

          {status === "error" ? (
            <div className="text-sm font-semibold text-[color:var(--brand-2)]">
              Could not submit vote. Please try again.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
