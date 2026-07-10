import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";

export default function TradePage() {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold text-muted">Trade</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                Trade in or sell your device.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
                Get a fair offer with clear next steps. Drop off in store or ask about
                postage options.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/service-finder?service=trade&mode=in_shop"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
                >
                  Find a trade-in store
                </Link>
                <Link
                  href="/campaigns/sell-broken-phone"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                >
                  Sell a broken phone
                </Link>
              </div>

              <div className="mt-8 grid gap-3 rounded-3xl border border-border bg-background p-6">
                <div className="text-sm font-semibold">How trade-in works</div>
                <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                  <div>Tell us the device and condition</div>
                  <div>We confirm an offer and next steps</div>
                  <div>Drop off at your nearest store</div>
                  <div>Or request postage / collection options</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <LeadForm
                kind="sell_quote"
                title="Get a trade quote"
                description="Share the device model, condition and anything important. We’ll come back with the next step."
                primaryLabel="Request a quote"
                meta={{ flow: "trade" }}
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

