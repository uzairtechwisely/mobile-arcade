import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { services } from "@/data/services";

export default function ServicesPage() {
  const repairServices = services.filter(
    (s) =>
      s.key !== "repair" &&
      s.key !== "3d_printed_case" &&
      s.key !== "buy_sell" &&
      s.key !== "products" &&
      s.key !== "repair_van",
  );

  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Repair services</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Choose a service to see what’s included and the best next step for your
            nearest branch.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repairServices.map((s) => (
            <Link
              key={s.key}
              href={`/services/${s.slug}`}
              className="group rounded-3xl border border-border bg-surface p-6 transition hover:shadow-sm"
            >
              <div className="text-sm font-semibold">{s.title}</div>
              <p className="mt-2 text-sm leading-6 text-muted">{s.summary}</p>
              {s.typicalTimeframe ? (
                <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                  {s.typicalTimeframe}
                </div>
              ) : null}
              <div className="mt-5 text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition group-hover:decoration-foreground">
                View details
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
