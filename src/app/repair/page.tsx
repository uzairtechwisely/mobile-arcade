import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { commonRepairs } from "@/data/home";
import { repairBrands } from "@/data/repair";

export default function RepairPage() {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-muted">Repair</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Choose your device, then choose your fix.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              iSmash-style flow, Mobile Arcade service. Pick a device to see common
              repairs, then we’ll show your nearest branch.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/service-finder?service=repair&mode=in_shop"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              >
                Find a store for repairs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              >
                Book / message us
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-background">
        <Container className="py-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Select your device
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Choose a device type to browse models and the most common repairs.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {repairBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/repair/${b.slug}`}
                className="group rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-inset ring-border"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{b.title}</div>
                    <div className="mt-1 text-xs font-semibold text-muted">
                      {b.description}
                    </div>
                  </div>
                </div>
                <div className="mt-5 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)] transition group-hover:brightness-95">
                  Choose model
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-background">
        <Container className="py-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Most common repairs
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Choose one to see nearest stores and options.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {commonRepairs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
              >
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {item.description}
                </p>
                <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                  Find stores
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
