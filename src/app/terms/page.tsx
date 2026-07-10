import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          This page will describe booking/repair terms, warranty guidance, and general
          site usage terms.
        </p>
      </Container>
    </div>
  );
}

