import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PollCard } from "@/components/poll/PollCard";

export default function CommunityPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <h1 className="text-4xl font-semibold tracking-tight">
              Local strength, small shop energy
            </h1>
            <p className="text-base leading-7 text-muted">
              We’re an independent business built around long-term community trust.
              That means being clear about options, fair about pricing, and helpful
              even when the best answer is “don’t repair it”.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">Human-centric by default</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Fewer steps, clearer language, and quick escape hatches like call
                  and contact at every decision point.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">Independent, but capable</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Five locations, shared standards, and consistent service across
                  the group.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-foreground p-6 text-background">
              <div className="text-xs font-semibold text-background/80">
                Future plans
              </div>
              <div className="mt-2 text-lg font-semibold leading-6">
                We want you involved in what we build next.
              </div>
              <p className="mt-2 text-sm leading-6 text-background/80">
                Vote in the poll and help shape what comes next for the community.
              </p>
              <Link
                href="/locations/norwich"
                className="mt-4 inline-flex rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                See Norwich branch
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <PollCard />
          </div>
        </div>
      </Container>
    </div>
  );
}

