"use client";

import { useState } from "react";

type LeadKind = "booking" | "sell_quote" | "campaign" | "at_home" | "postage";

export function LeadForm({
  kind,
  title,
  description,
  primaryLabel,
  meta,
}: {
  kind: LeadKind;
  title: string;
  description?: string;
  primaryLabel: string;
  meta?: Record<string, unknown>;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);

    const payload = {
      kind,
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || "") || undefined,
      email: String(fd.get("email") || "") || undefined,
      postcode: String(fd.get("postcode") || "") || undefined,
      message: String(fd.get("message") || "") || undefined,
      meta,
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res || !res.ok) {
      setStatus("error");
      setError("Something went wrong. Please try again or use the contact page.");
      return;
    }

    setStatus("success");
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <div className="text-sm font-semibold">{title}</div>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      ) : null}

      {status === "success" ? (
        <div className="mt-5 rounded-2xl border border-border bg-background p-4 text-sm">
          <div className="font-semibold">Thanks — we’ve got it.</div>
          <div className="mt-1 text-muted">
            We’ll respond as soon as possible with the next step.
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-muted">Name</label>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted">
              Phone (optional)
            </label>
            <input
              name="phone"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-muted">
              Email (optional)
            </label>
            <input
              type="email"
              name="email"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted">
              Postcode (optional)
            </label>
            <input
              name="postcode"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted">
            Details (device + issue)
          </label>
          <textarea
            name="message"
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {status === "error" ? (
          <div className="text-sm font-semibold text-[color:var(--brand-2)]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-background transition hover:brightness-95 disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : primaryLabel}
        </button>
      </form>
    </div>
  );
}
