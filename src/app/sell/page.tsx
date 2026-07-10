import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";

export default function SellPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-6">
            <h1 className="text-4xl font-semibold tracking-tight">Sell your device</h1>
            <p className="text-base leading-7 text-muted">
              Get a quick quote with a clear next step: drop into your nearest
              branch or use a nationwide collection option.
            </p>

            <div className="rounded-3xl border border-border bg-foreground p-6 text-background">
              <div className="text-xs font-semibold text-background/80">
                Simple options
              </div>
              <div className="mt-2 text-lg font-semibold leading-6">
                Local drop-off when you’re nearby. Postage when you’re not.
              </div>
              <p className="mt-2 text-sm leading-6 text-background/80">
                If you’re outside our branch range, we can guide you through
                prepaid postage or collection (where available).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/service-finder"
                  className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
                >
                  Find nearest branch
                </Link>
                <Link
                  href="/campaigns/sell-broken-phone"
                  className="rounded-full bg-background/10 px-4 py-2 text-sm font-semibold text-background ring-1 ring-inset ring-background/20 transition hover:bg-background/15"
                >
                  Nationwide collection
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <LeadForm
              kind="sell_quote"
              title="Get a free quote"
              description="Tell us what you have and we’ll respond with the best option."
              primaryLabel="Request a quote"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

