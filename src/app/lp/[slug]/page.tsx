import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { landingPageBySlug } from "@/lib/landing-pages";

export function generateStaticParams() {
  return Object.keys(landingPageBySlug).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const cfg = landingPageBySlug[params.slug];
  if (!cfg) return {};
  return { title: cfg.title, description: cfg.heroSubtitle };
}

export default function LandingPageRoute({
  params,
}: {
  params: { slug: string };
}) {
  const cfg = landingPageBySlug[params.slug];
  if (!cfg) notFound();
  return <LandingPage cfg={cfg} />;
}

