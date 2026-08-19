import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getLandingPage, getLandingSlugs } from "@/lib/landing-pages";

export function generateStaticParams() {
  return getLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cfg = getLandingPage(slug);
  if (!cfg) return {};
  return { title: cfg.title, description: cfg.heroSubtitle };
}

export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cfg = getLandingPage(slug);
  if (!cfg) notFound();
  return <LandingPage cfg={cfg} />;
}
