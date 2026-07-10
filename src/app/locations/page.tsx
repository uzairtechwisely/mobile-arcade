import { branches } from "@/data/branches";
import { Container } from "@/components/ui/Container";
import { LocationsClient } from "./LocationsClient";

export default function LocationsPage() {
  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Locations</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Choose your local branch to see opening times, services and directions.
          </p>
        </div>

        <div className="mt-10">
          <LocationsClient branches={branches} />
        </div>
      </Container>
    </div>
  );
}
