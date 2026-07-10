import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";

export default function ProductsPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-6">
            <h1 className="text-4xl font-semibold tracking-tight">
              Products in stock
            </h1>
            <p className="text-base leading-7 text-muted">
              Accessories, chargers, cables, cases and more. This section will show
              live availability per branch.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">Accessories</div>
                <div className="mt-2 text-sm leading-6 text-muted">
                  Chargers, cables, earbuds, screen protectors.
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">Refurbished devices</div>
                <div className="mt-2 text-sm leading-6 text-muted">
                  Quality-checked, professionally refurbished phones.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-foreground p-6 text-white">
              <div className="text-xs font-semibold text-white/80">
                Want something specific?
              </div>
              <div className="mt-2 text-lg font-semibold leading-6">
                Tell us what you’re looking for — we’ll check stock.
              </div>
              <p className="mt-2 text-sm leading-6 text-white/80">
                We’ll confirm availability and the best branch to visit.
              </p>
              <Link
                href="/service-finder?service=products"
                className="mt-4 inline-flex rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                Find a branch
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <LeadForm
              kind="campaign"
              title="Stock check request"
              description="Tell us what you want and we’ll respond with availability."
              primaryLabel="Request stock check"
              meta={{ source: "products" }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

