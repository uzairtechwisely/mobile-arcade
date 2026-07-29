import { RequestForm } from "./request-form";

const highlights = [
  "Same-day quote response",
  "Phones, tablets, watches, and consoles",
  "Transparent grading and payout process",
];

const trustPoints = [
  {
    title: "Fast evaluations",
    description:
      "Send your device details once and get a clear quote without long back-and-forth.",
  },
  {
    title: "Flexible handoff",
    description:
      "Offer local drop-off, pickup coordination, or prepaid shipping once you approve the offer.",
  },
  {
    title: "Data-conscious process",
    description:
      "Guide customers through backup, sign-out, and reset steps before the device changes hands.",
  },
];

const steps = [
  {
    title: "1. Tell us about the device",
    description:
      "Share the model, storage, condition, and your preferred way to be contacted.",
  },
  {
    title: "2. Receive a quote",
    description:
      "Mobile Arcade reviews the details and responds with an estimated offer and next steps.",
  },
  {
    title: "3. Get paid",
    description:
      "Once the device is confirmed, finalize the sale with the agreed payment method.",
  },
];

const categories = [
  "iPhone and Android phones",
  "iPads and tablets",
  "Apple Watch and smartwatches",
  "Nintendo Switch and handheld consoles",
];

const faqs = [
  {
    question: "What devices do you buy?",
    answer:
      "Use this page for phones, tablets, smartwatches, and popular handheld gaming devices. The copy is easy to expand for laptops or accessories later.",
  },
  {
    question: "How quickly can customers hear back?",
    answer:
      "The landing page is written around a same-day response promise, but you can adjust the wording to match your actual operations.",
  },
  {
    question: "How are leads delivered?",
    answer:
      "The form already supports a webhook or Resend email delivery through environment variables. Without that setup, requests are logged on the server for testing.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#e2e8f0_42%,_#f8fafc_100%)]">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-12">
        <header className="mb-16 flex flex-col gap-4 border-b border-white/10 pb-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Mobile Arcade
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Buyback offers for phones, tablets, wearables, and gaming devices
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <a
              href="#how-it-works"
              className="rounded-full border border-white/12 px-4 py-2 transition hover:border-cyan-300 hover:text-cyan-200"
            >
              How it works
            </a>
            <a
              href="#request-form"
              className="rounded-full bg-cyan-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Get my offer
            </a>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="pb-8 text-white">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Turn unused tech into cash with a simple quote request
            </div>

            <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Sell your device to Mobile Arcade without the marketplace hassle
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Help customers request offers for their phones, tablets,
              smartwatches, and gaming gear from one focused landing page built
              for mobile-first conversions.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#request-form"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Request a quote
              </a>
              <a
                href="mailto:offers@mobilearcade.example"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                offers@mobilearcade.example
              </a>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <RequestForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {trustPoints.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-4 sm:px-8 lg:px-12"
      >
        <div className="grid gap-10 rounded-[32px] bg-slate-950 px-6 py-10 text-white sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around a clear, low-friction selling journey
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              The page is structured to answer the main trust questions early,
              explain the quote process, and move visitors into the form without
              distractions.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Popular categories
              </p>
              <ul className="mt-4 grid gap-3 text-sm text-slate-200">
                {categories.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/10 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-5">
            {steps.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Why It Converts
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Designed for customers who want speed and confidence
            </h2>
          </div>
          <div className="grid gap-5">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-[28px] border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
