import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";
import { getCampaignBySlug } from "@/data/campaigns";

export default function CampaignLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = getCampaignBySlug(params.slug);
  if (!campaign) notFound();

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-foreground text-background">
        <Container className="py-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="space-y-6 lg:col-span-7">
              <div className="text-xs font-semibold text-background/80">
                Campaign landing page
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {campaign.headline}
              </h1>
              <p className="max-w-xl text-base leading-7 text-background/80">
                {campaign.offerText}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/service-finder"
                  className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
                >
                  Find a local branch
                </Link>
                <Link
                  href="/services"
                  className="rounded-full bg-background/10 px-5 py-2 text-sm font-semibold text-background ring-1 ring-inset ring-background/20 transition hover:bg-background/15"
                >
                  Browse services
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-background/15 bg-background/5 p-6">
                <div className="text-sm font-semibold">Why people choose us</div>
                <div className="mt-3 grid gap-2 text-sm text-background/80">
                  <div>Transparent options before you commit</div>
                  <div>Local branches + nationwide collection</div>
                  <div>Clear warranty guidance</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="text-sm font-semibold">How it works</div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <li>
                  <span className="font-semibold text-foreground">1.</span> Tell us
                  what you have and its condition.
                </li>
                <li>
                  <span className="font-semibold text-foreground">2.</span> We reply
                  with the best option (drop-off, postage, or collection).
                </li>
                <li>
                  <span className="font-semibold text-foreground">3.</span> You choose
                  what suits you — no pressure.
                </li>
              </ol>
            </div>
          </div>

          <div className="lg:col-span-6">
            <LeadForm
              kind="campaign"
              title={campaign.primaryCta}
              description="Submit the details and we’ll respond with the next step."
              primaryLabel={campaign.primaryCta}
              meta={{ campaign: campaign.slug }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

