import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";

export default function CustomisePage() {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold text-muted">Customise</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                Customise your device, made locally.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
                From practical protective options to custom 3D printed designs, we’ll
                help you build something that fits your style and your day-to-day.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/service-finder?service=customise&mode=in_shop"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
                >
                  Find a store for custom work
                </Link>
                <Link
                  href="/service-finder?service=3d_printed_case&mode=in_shop"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                >
                  3D printed case
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="text-sm font-semibold">3D printed cases</div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Custom designs, prototypes and practical solutions made locally.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="text-sm font-semibold">Accessories & add-ons</div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Cases, chargers and everyday essentials to keep you moving.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <LeadForm
                kind="booking"
                title="Request a custom job"
                description="Tell us what you want to customise and which device it’s for. We’ll confirm what’s possible and the next step."
                primaryLabel="Send request"
                meta={{ flow: "customise" }}
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

