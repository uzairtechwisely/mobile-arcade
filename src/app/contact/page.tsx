import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";
import { branches } from "@/data/branches";

export default function ContactPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-5">
            <h1 className="text-4xl font-semibold tracking-tight">Book / Contact</h1>
            <p className="text-base leading-7 text-muted">
              Book a repair, ask a question, or tell us what device you’re selling.
              We’ll reply with the clearest next step.
            </p>

            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="text-sm font-semibold">Quick links</div>
              <div className="mt-4 grid gap-2 text-sm">
                <a
                  href={`tel:${branches[0]?.phone ?? ""}`}
                  className="text-muted hover:text-foreground"
                >
                  Call: {branches[0]?.phone ?? "TBC"}
                </a>
                <a
                  href="mailto:mobilearcade8@gmail.com"
                  className="text-muted hover:text-foreground"
                >
                  Email: mobilearcade8@gmail.com
                </a>
                <Link href="/locations" className="text-muted hover:text-foreground">
                  See all locations
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <LeadForm
              kind="booking"
              title="Request a booking"
              description="Include your device model, the issue, and your preferred branch/time window."
              primaryLabel="Send booking request"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

