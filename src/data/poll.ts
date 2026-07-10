import { Poll } from "@/lib/types";

export const activePoll: Poll = {
  slug: "future-plans-2026",
  question: "Which idea should we build next in Norwich?",
  options: [
    { key: "gaming-zone", label: "Gaming zone on the first floor" },
    { key: "toy-gift-shop", label: "Toy & gift shop" },
    { key: "workshops", label: "Workshops (repair & safety)" },
  ],
};
