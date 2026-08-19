"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { LandingPageConfig } from "@/lib/landing-pages";

type DeviceType = "phone" | "laptop" | "tablet" | "gaming";

const deviceTypes: Array<{
  key: DeviceType;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "phone",
    label: "Phones",
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
        <path
          d="M8 2.5h8A2.5 2.5 0 0 1 18.5 5v14A2.5 2.5 0 0 1 16 21.5H8A2.5 2.5 0 0 1 5.5 19V5A2.5 2.5 0 0 1 8 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 5.2h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "laptop",
    label: "Laptop",
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
        <path
          d="M5 6.5h14A2 2 0 0 1 21 8.5v7H3v-7A2 2 0 0 1 5 6.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2.5 16.5h19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "tablet",
    label: "Tablets/iPad",
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
        <path
          d="M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 18h0.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "gaming",
    label: "Gaming",
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
        <path
          d="M8.5 10.5h7A4.5 4.5 0 0 1 20 15v2.2a2.3 2.3 0 0 1-4 1.6l-1.2-1.3a2 2 0 0 0-1.5-.7h-2.6a2 2 0 0 0-1.5.7L8 18.8a2.3 2.3 0 0 1-4-1.6V15a4.5 4.5 0 0 1 4.5-4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 13.5v3M7.5 15h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16.3 14.4h0.01M17.6 15.7h0.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const makes = ["Apple", "Samsung", "Google", "OnePlus", "Huawei", "Xiaomi"];
const models = [
  "iPhone 15",
  "iPhone 14",
  "iPhone 13",
  "Galaxy S24",
  "Galaxy S23",
  "Pixel 8",
  "Pixel 7",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm opacity-0 animate-[confetti_900ms_ease-out_forwards]"
          style={{
            left: `${(i * 97) % 100}%`,
            background:
              i % 3 === 0
                ? "var(--brand)"
                : i % 3 === 1
                  ? "var(--brand-light)"
                  : "var(--brand-2)",
            animationDelay: `${(i % 10) * 45}ms`,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div
        className="absolute inset-0 bg-[rgba(7,7,7,0.55)]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm font-semibold text-muted hover:bg-background"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function LandingPage({ cfg }: { cfg: LandingPageConfig }) {
  const [deviceType, setDeviceType] = useState<DeviceType>("phone");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const offer = useMemo(() => {
    const base =
      deviceType === "phone"
        ? 220
        : deviceType === "laptop"
          ? 310
          : deviceType === "tablet"
            ? 180
            : 150;
    const tweak = (make.length * 7 + model.length * 3) % 90;
    return base + tweak;
  }, [deviceType, make, model]);

  return (
    <div className="relative">
      <style>{`@keyframes confetti{0%{transform:translateY(-10px) rotate(0deg);opacity:0}20%{opacity:1}100%{transform:translateY(260px) rotate(260deg);opacity:0}}`}</style>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25"
        style={{
          backgroundImage: `url(${cfg.backgroundImageUrl})`,
          backgroundAttachment: "fixed",
        }}
      />

      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-horizontal.png"
              alt="Mobile Arcade"
              width={150}
              height={34}
              className="h-7 w-auto"
              priority
            />
          </div>
          <a
            href="#quote"
            className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
          >
            {cfg.navCtaLabel}
          </a>
        </Container>
      </header>

      <section className="bg-background/30">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {cfg.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              {cfg.heroSubtitle}
            </p>
          </div>

          <div
            id="quote"
            className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="text-center text-sm font-semibold text-muted">
              What device would you like to trade in?
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {deviceTypes.map((t) => {
                const active = t.key === deviceType;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDeviceType(t.key)}
                    className={`flex flex-col items-center justify-center rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                      active
                        ? "border-brand bg-[rgba(232,242,255,0.85)] text-brand"
                        : "border-border bg-background text-foreground hover:bg-white"
                    }`}
                  >
                    <div className="text-brand">{t.icon}</div>
                    <div className="mt-2">{t.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_1fr]">
              <div>
                <label className="block text-xs font-semibold text-muted">
                  Make
                </label>
                <input
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  list="lp-makes"
                  placeholder="e.g. Apple"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <datalist id="lp-makes">
                  {makes.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted">
                  Model
                </label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  list="lp-models"
                  placeholder="e.g. iPhone 13"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <datalist id="lp-models">
                  {models.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setOfferOpen(true)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
                >
                  Find my device value
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="relative overflow-hidden rounded-[28px] bg-brand p-8 text-white shadow-[0_24px_70px_rgba(0,106,252,0.25)]">
              <div className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">
                    {cfg.promoTitle}
                  </div>
                  <div className="mt-2 text-lg font-semibold opacity-95">
                    {cfg.promoSubtitle}
                  </div>
                  <a
                    href="#quote"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition hover:brightness-95"
                  >
                    {cfg.promoCtaLabel}
                  </a>
                </div>
                <div className="relative mx-auto h-[160px] w-[220px]">
                  <Image
                    src={cfg.promoImageUrl}
                    alt="Trade-in devices"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-background">
        <Container className="py-14">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Three easy steps
            </h2>
            <p className="mt-3 text-sm font-semibold text-muted">
              To turn your old device into cash
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {cfg.steps.map((s, idx) => (
              <div
                key={s.title}
                className="rounded-3xl border border-border bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
              >
                <div className="relative h-32 overflow-hidden rounded-2xl bg-background">
                  <Image
                    src={s.imageUrl}
                    alt={s.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 text-xs font-semibold text-brand">
                  Step {idx + 1}
                </div>
                <div className="mt-2 text-sm font-semibold">{s.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-white">
        <Container className="py-14">
          <h2 className="text-2xl font-semibold tracking-tight">FAQs</h2>
          <div className="mt-7 divide-y divide-border rounded-3xl border border-border bg-background">
            {cfg.faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  <span>{f.q}</span>
                  <span className="text-muted transition group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <footer className="border-t border-border bg-background">
        <Container className="py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <Image
                src="/brand/logo-horizontal.png"
                alt="Mobile Arcade"
                width={150}
                height={34}
                className="h-7 w-auto"
              />
              <p className="max-w-sm text-sm leading-6 text-muted">
                Device trade-in made simple. Get an estimate, send your device, and
                get paid fast.
              </p>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-muted">
              <a href="#quote" className="hover:text-foreground">
                Get a quote
              </a>
              <a href="#quote" className="hover:text-foreground">
                How it works
              </a>
              <a href="#quote" className="hover:text-foreground">
                FAQs
              </a>
            </div>
            <div className="flex items-start gap-3 md:justify-end">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-muted shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:text-foreground"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-muted shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:text-foreground"
              >
                ⌁
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-muted shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:text-foreground"
              >
                ♪
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Mobile Arcade. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
            </div>
          </div>
        </Container>
      </footer>

      <Modal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        title="Your estimated offer"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-5">
          <Confetti />
          <div className="text-sm font-semibold text-muted">Estimated value</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-brand">
            {formatCurrency(offer)}
          </div>
          <div className="mt-3 text-sm text-muted">
            Based on the details you entered. Final offer confirmed after inspection.
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              onClick={() => setOfferOpen(false)}
            >
              Accept & book collection
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              onClick={() => setOfferOpen(false)}
            >
              Not happy with price
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

