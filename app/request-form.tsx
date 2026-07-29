"use client";

import { useState, type FormEvent } from "react";

import { initialRequestState, type RequestState } from "./lib/sell-request";

function FieldError({ state, name }: { state: RequestState; name: string }) {
  const message = state.errors[name];

  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-300">{message}</p>;
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Sending request..." : "Request my offer"}
    </button>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white/10";

export function RequestForm() {
  const [state, setState] = useState<RequestState>(initialRequestState);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialRequestState);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/sell-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as RequestState;
      setState(result);

      if (response.ok) {
        form.reset();
      }
    } catch {
      setState({
        success: false,
        message: "We could not submit your request right now. Please try again.",
        errors: {},
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      id="request-form"
      className="rounded-[28px] border border-white/12 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8"
    >
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
          Sell Your Device
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Start your quote in under a minute
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Share a few device details and Mobile Arcade can follow up with a fair
          offer, next steps, and drop-off or shipping options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Full name
            </span>
            <input
              className={inputClassName}
              type="text"
              name="fullName"
              placeholder="Jane Smith"
              autoComplete="name"
            />
            <FieldError state={state} name="fullName" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Email address
            </span>
            <input
              className={inputClassName}
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FieldError state={state} name="email" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Phone number
            </span>
            <input
              className={inputClassName}
              type="tel"
              name="phone"
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
            <FieldError state={state} name="phone" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Device model
            </span>
            <input
              className={inputClassName}
              type="text"
              name="deviceModel"
              placeholder="iPhone 15 Pro 256GB"
            />
            <FieldError state={state} name="deviceModel" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Condition
            </span>
            <select className={inputClassName} name="condition" defaultValue="">
              <option value="" disabled>
                Select condition
              </option>
              <option value="Like new">Like new</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
            <FieldError state={state} name="condition" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Storage size
            </span>
            <select className={inputClassName} name="storage" defaultValue="">
              <option value="" disabled>
                Select storage
              </option>
              <option value="64GB">64GB</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB or more">512GB or more</option>
            </select>
            <FieldError state={state} name="storage" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Preferred contact method
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Call", "Text", "Email"].map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-slate-200"
              >
                <input
                  className="h-4 w-4 accent-cyan-400"
                  type="radio"
                  name="preferredContact"
                  value={option}
                />
                {option}
              </label>
            ))}
          </div>
          <FieldError state={state} name="preferredContact" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Expected price
          </span>
          <input
            className={inputClassName}
            type="text"
            name="expectedPrice"
            placeholder="$450"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Extra details
          </span>
          <textarea
            className={`${inputClassName} min-h-28 resize-y`}
            name="notes"
            placeholder="Tell us about battery health, scratches, carrier status, or accessories included."
          />
        </label>

        {state.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.success
                ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border border-rose-400/40 bg-rose-400/10 text-rose-200"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="space-y-3">
          <SubmitButton pending={pending} />
          <p className="text-xs leading-5 text-slate-400">
            By submitting, you agree to be contacted about your device quote.
            Replace the placeholder contact routing with your real lead inbox or
            webhook before launch.
          </p>
        </div>
      </form>
    </div>
  );
}
