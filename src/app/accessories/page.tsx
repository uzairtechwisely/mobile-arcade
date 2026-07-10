import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ECOMMERCE_URL } from "@/lib/public-config";

const popularAccessories = [
  { title: "Chargers & cables", subtitle: "USB‑C, Lightning, fast charging" },
  { title: "Cases & screen protection", subtitle: "Everyday protection and style" },
  { title: "Audio & gadgets", subtitle: "Earphones, adapters and extras" },
] as const;

export default function AccessoriesPage() {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-muted">Shop</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Accessories that keep you moving.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              Browse accessories on our online shop. Prefer to pick up in store or ask
              for advice? Use the store finder.
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
                href="/service-finder?service=accessories&mode=in_shop"
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
              Popular categories
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Open the online shop to see up-to-date listings.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {popularAccessories.map((item) => (
              <a
                key={item.title}
                href={ECOMMERCE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
              >
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.subtitle}</p>
                <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                  View listings
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

