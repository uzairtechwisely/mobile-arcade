import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ECOMMERCE_URL } from "@/lib/public-config";

const sections = [
  {
    title: "Buy refurbished",
    description: "Quality refurbished devices on our online shop.",
    href: "/refurbished",
    external: false,
  },
  {
    title: "Buy accessories",
    description: "Chargers, cases, cables and essentials.",
    href: "/accessories",
    external: false,
  },
  {
    title: "Explore all items",
    description: "Browse the full catalogue on the online shop.",
    href: ECOMMERCE_URL,
    external: true,
  },
] as const;

export default function ExplorePage() {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-muted">Shop</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Explore products and refurbished devices.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              Our online shop opens in a new tab. If you’d rather speak to a person,
              use the store finder and we’ll point you to your nearest branch.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={ECOMMERCE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              >
                Open online shop
              </a>
              <Link
                href="/service-finder?service=explore&mode=in_shop"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              >
                Find a store
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-background">
        <Container className="py-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with a category
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Pick one, then browse listings on the online shop.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {sections.map((s) =>
              s.external ? (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
                >
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted">{s.description}</p>
                  <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                    Open
                  </div>
                </a>
              ) : (
                <Link
                  key={s.title}
                  href={s.href}
                  className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
                >
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted">{s.description}</p>
                  <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                    View
                  </div>
                </Link>
              ),
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
