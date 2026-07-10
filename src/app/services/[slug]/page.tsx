import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug } from "@/data/services";

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  const serviceFinderHref = `/service-finder?service=${encodeURIComponent(
    service.key,
  )}`;

  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="text-xs font-semibold text-muted">Service</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {service.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">{service.summary}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">What happens next</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use the service finder to see the closest branch on the map and
                  book in minutes.
                </p>
                <Link
                  href={serviceFinderHref}
                  className="mt-4 inline-flex rounded-full bg-brand px-5 py-2 text-sm font-semibold text-background transition hover:brightness-95"
                >
                  Find a branch for this service
                </Link>
              </div>
              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="text-sm font-semibold">Warranty & care</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  We aim to be clear about parts, timeframes and warranty before
                  you commit.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border transition hover:bg-surface"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-border bg-foreground p-6 text-background">
              <div className="text-xs font-semibold text-background/80">
                Human-centric service
              </div>
              <div className="mt-2 text-lg font-semibold leading-6">
                Clear advice, no pressure.
              </div>
              <p className="mt-2 text-sm leading-6 text-background/80">
                If it’s repairable we’ll tell you. If it’s not worth it, we’ll tell
                you that too.
              </p>
              <Link
                href="/community"
                className="mt-4 inline-flex rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                See local story
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

