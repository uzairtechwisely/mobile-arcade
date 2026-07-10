import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          This page will outline how we use contact details submitted through booking,
          quote and campaign forms.
        </p>
      </Container>
    </div>
  );
}

