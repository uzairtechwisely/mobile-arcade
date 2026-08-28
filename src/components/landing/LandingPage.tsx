"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { type LandingPageConfig } from "@/lib/landing-pages";
import {
  conditionLabels,
  deviceConditions,
  formatCurrency,
  getCategoryLabel,
  type QuoteSummary,
  type TradeConfirmation,
} from "@/lib/trade/shared";

type DeviceCategory = "phone" | "laptop" | "tablet" | "gaming_device";
type DeviceSuggestion = {
  id: string;
  brand: string;
  model: string;
  category: DeviceCategory;
  label: string;
};

const deviceTypes: Array<{
  key: DeviceCategory;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "phone",
    label: "Phones",
    icon: (
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
        <path
          d="M8 2.5h8A2.5 2.5 0 0 1 18.5 5v14A2.5 2.5 0 0 1 16 21.5H8A2.5 2.5 0 0 1 5.5 19V5A2.5 2.5 0 0 1 8 2.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M10 5.2h4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "laptop",
    label: "Laptop",
    icon: (
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
        <path
          d="M5 6.5h14A2 2 0 0 1 21 8.5v7H3v-7A2 2 0 0 1 5 6.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M2.5 16.5h19"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "tablet",
    label: "Tablets/iPad",
    icon: (
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
        <path
          d="M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M12 18h0.01"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "gaming_device",
    label: "Gaming",
    icon: (
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
        <path
          d="M8.5 10.5h7A4.5 4.5 0 0 1 20 15v2.2a2.3 2.3 0 0 1-4 1.6l-1.2-1.3a2 2 0 0 0-1.5-.7h-2.6a2 2 0 0 0-1.5.7L8 18.8a2.3 2.3 0 0 1-4-1.6V15a4.5 4.5 0 0 1 4.5-4.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M9 13.5v3M7.5 15h3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M16.3 14.4h0.01M17.6 15.7h0.01"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const postageServices = [
  "Royal Mail",
  "Evri",
  "DPD",
  "UPS",
  "ParcelForce",
  "Other",
] as const;

const carrierPortalLinks: Record<string, string> = {
  "Royal Mail": "https://www.royalmail.com/business/send/parcels",
  Evri: "https://www.evri.com/business",
  DPD: "https://www.dpdlocal-online.co.uk/",
  UPS: "https://www.ups.com/gb/en/business-solutions.page",
  ParcelForce: "https://www.parcelforce.com/business-services",
};

const sampleModelHints: Record<DeviceCategory, string[]> = {
  phone: [
    "Apple iPhone 16 Pro",
    "Apple iPhone 15",
    "Samsung Galaxy S24 Ultra",
    "Samsung Galaxy S23",
  ],
  laptop: ["Apple MacBook Air M2", "Apple MacBook Pro 14", "Dell XPS 13"],
  tablet: ["Apple iPad Air 5", "Apple iPad 10th Gen", "Samsung Galaxy Tab S9"],
  gaming_device: ["Sony PlayStation 5", "Microsoft Xbox Series X", "Nintendo Switch OLED"],
};

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm opacity-0 animate-[confetti_950ms_ease-out_forwards]"
          style={{
            left: `${(i * 97) % 100}%`,
            background:
              i % 3 === 0
                ? "var(--brand)"
                : i % 3 === 1
                  ? "var(--brand-light)"
                  : "var(--brand-2)",
            animationDelay: `${(i % 10) * 45}ms`,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressPill({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand text-white"
          : complete
            ? "bg-[rgba(232,242,255,0.85)] text-brand"
            : "bg-white text-muted ring-1 ring-inset ring-border"
      }`}
    >
      {label}
    </div>
  );
}

function SlideFrame({
  children,
  alignTop = false,
}: {
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className="w-full shrink-0 px-1">
      <div
        className={`min-h-[calc(100vh-170px)] rounded-[36px] bg-transparent ${
          alignTop
            ? "flex items-start justify-center"
            : "flex items-center justify-center"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
      {children}
    </div>
  );
}

async function postJson<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data;
}

export function LandingPage({ cfg }: { cfg: LandingPageConfig }) {
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>("phone");
  const [modelQuery, setModelQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<DeviceSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<DeviceSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [condition, setCondition] = useState<(typeof deviceConditions)[number]["key"]>(
    "good",
  );
  const [requestedAmount, setRequestedAmount] = useState("");
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankSortCode, setBankSortCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [postageService, setPostageService] = useState("Royal Mail");
  const [customPostageService, setCustomPostageService] = useState("");
  const [postageTrackingReference, setPostageTrackingReference] = useState("");
  const [estimatedPostageCost, setEstimatedPostageCost] = useState("8");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [trade, setTrade] = useState<TradeConfirmation | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (modelQuery.trim().length === 0) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const query = encodeURIComponent(modelQuery.trim());
        const response = await fetch(
          `/api/trade/models?category=${deviceCategory}&query=${query}`,
          {
            signal: controller.signal,
          },
        );
        const data = (await response.json()) as {
          models?: DeviceSuggestion[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load devices.");
        }

        setSuggestions(data.models ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deviceCategory, modelQuery]);

  const resolvedPostageService =
    postageService === "Other" ? customPostageService : postageService;

  const cashWithReward =
    quote?.cashOfferGbp && quote.reward?.isCash
      ? quote.cashOfferGbp + quote.reward.valueGbp
      : quote?.cashOfferGbp ?? 0;

  const carrierPortalLink = trade
    ? carrierPortalLinks[trade.postageService]
    : carrierPortalLinks[resolvedPostageService];

  function moveToStep(step: number) {
    setCurrentStep(step);
    setErrorMessage(null);
  }

  function resetJourney() {
    setCurrentStep(0);
    setQuote(null);
    setTrade(null);
    setSelectedModel(null);
    setModelQuery("");
    setSuggestions([]);
    setRequestedAmount("");
    setCondition("good");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerMobile("");
    setCollectionAddress("");
    setBankAccountName("");
    setBankSortCode("");
    setBankAccountNumber("");
    setPostageService("Royal Mail");
    setCustomPostageService("");
    setPostageTrackingReference("");
    setEstimatedPostageCost("8");
    setTermsAccepted(false);
    setErrorMessage(null);
  }

  function handleCategoryChange(nextCategory: DeviceCategory) {
    setDeviceCategory(nextCategory);
    setSelectedModel(null);
    setModelQuery("");
    setSuggestions([]);
  }

  async function handleQuoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setTrade(null);

    if (!selectedModel) {
      setErrorMessage("Please choose a model from the suggestions first.");
      return;
    }

    const requested = Number(requestedAmount);
    if (!Number.isFinite(requested) || requested <= 0) {
      setErrorMessage("Enter how much you want in GBP.");
      return;
    }

    try {
      setQuoteLoading(true);
      const data = await postJson<{ quote: QuoteSummary }>("/api/trade/quote", {
        category: deviceCategory,
        deviceModelId: selectedModel.id,
        condition,
        requestedAmountGbp: requested,
      });
      setQuote(data.quote);
      moveToStep(1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to get your quote.",
      );
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleRewardAction(action: "play" | "skip") {
    if (!quote) return;

    try {
      setRewardLoading(true);
      setErrorMessage(null);
      const data = await postJson<{ quote: QuoteSummary }>("/api/trade/reward", {
        quoteId: quote.id,
        action,
      });
      setQuote(data.quote);
      moveToStep(3);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to continue the bonus step.",
      );
    } finally {
      setRewardLoading(false);
    }
  }

  async function handleConfirmTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote) return;

    try {
      setConfirmLoading(true);
      setErrorMessage(null);
      const data = await postJson<{ trade: TradeConfirmation }>(
        "/api/trade/confirm",
        {
          quoteId: quote.id,
          customerName,
          customerEmail,
          customerMobile,
          collectionAddress,
          bankAccountName,
          bankSortCode,
          bankAccountNumber,
          postageService: resolvedPostageService,
          postageTrackingReference,
          estimatedPostageCostGbp: Number(estimatedPostageCost),
          termsAccepted,
        },
      );
      setTrade(data.trade);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to confirm your trade.",
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div className="relative bg-[#f2f3f5]">
      <style>{`@keyframes confetti{0%{transform:translateY(-10px) rotate(0deg);opacity:0}20%{opacity:1}100%{transform:translateY(260px) rotate(260deg);opacity:0}}`}</style>

      <header className="border-b border-black/5 bg-white/98">
        <Container className="flex items-center justify-center py-5 sm:py-6">
          <Image
            src="/brand/logo-horizontal.png"
            alt="Mobile Arcade"
            width={220}
            height={48}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Container>
      </header>

      <section id="hero-flow" className="overflow-hidden bg-[#f2f3f5]">
        <Container className="py-6 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-2 pb-5">
              <ProgressPill label="Step 1" active={currentStep === 0} complete={currentStep > 0} />
              <ProgressPill label="Step 2" active={currentStep === 1} complete={currentStep > 1} />
              <ProgressPill label="Step 3" active={currentStep === 2} complete={currentStep > 2} />
              <ProgressPill label="Step 4" active={currentStep === 3} complete={Boolean(trade)} />
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-2xl border border-[rgba(220,38,38,0.16)] bg-[rgba(254,242,242,1)] px-4 py-3 text-sm text-[rgba(153,27,27,1)]">
                {errorMessage}
              </div>
            ) : null}

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                <SlideFrame>
                  <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                      {cfg.heroTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                      {cfg.heroSubtitle}
                    </p>

                    <form
                      onSubmit={handleQuoteSubmit}
                      className="mt-10 w-full rounded-[36px] bg-[#f2f3f5] px-4 py-2 sm:px-10"
                    >
                      <div className="text-2xl font-semibold tracking-tight text-foreground">
                        What device would you like to trade in?
                      </div>

                      <div className="mt-8 grid gap-4 sm:grid-cols-4">
                        {deviceTypes.map((item) => {
                          const active = item.key === deviceCategory;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleCategoryChange(item.key)}
                              className={`rounded-3xl px-4 py-5 text-center transition ${
                                active
                                  ? "text-brand"
                                  : "text-foreground hover:text-brand"
                              }`}
                            >
                              <div className="flex justify-center">{item.icon}</div>
                              <div className="mt-3 text-base font-medium">{item.label}</div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.55fr]">
                        <div className="rounded-full border border-black/20 bg-white px-5 py-1">
                          <input
                            value={modelQuery}
                            onChange={(event) => {
                              setModelQuery(event.target.value);
                              setSelectedModel(null);
                            }}
                            placeholder={`Search your ${getCategoryLabel(deviceCategory).toLowerCase()}`}
                            className="h-12 w-full bg-transparent text-sm font-medium outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 rounded-[28px] bg-white/80 p-2 ring-1 ring-inset ring-black/5">
                          <select
                            value={condition}
                            onChange={(event) =>
                              setCondition(
                                event.target.value as (typeof deviceConditions)[number]["key"],
                              )
                            }
                            className="rounded-full bg-[#f2f3f5] px-4 py-3 text-sm font-medium outline-none"
                          >
                            {deviceConditions.map((item) => (
                              <option key={item.key} value={item.key}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center rounded-full bg-[#f2f3f5] px-4">
                            <span className="text-sm font-semibold text-muted">£</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              value={requestedAmount}
                              onChange={(event) => setRequestedAmount(event.target.value)}
                              placeholder="250"
                              className="h-12 w-full bg-transparent px-2 text-sm font-semibold outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={quoteLoading}
                          className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,106,252,0.22)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-65"
                        >
                          {quoteLoading ? "Finding..." : "Find my phone value"}
                        </button>
                      </div>

                      <div className="mx-auto mt-2 max-w-3xl text-left">
                        <div className="px-2 text-xs leading-5 text-muted">
                          Try{" "}
                          {sampleModelHints[deviceCategory].slice(0, -1).join(", ")}{" "}
                          or{" "}
                          {
                            sampleModelHints[deviceCategory][
                              sampleModelHints[deviceCategory].length - 1
                            ]
                          }
                          .
                        </div>
                      </div>

                      {modelQuery.trim().length > 0 ? (
                        <div className="mx-auto mt-3 max-w-3xl rounded-[28px] border border-black/6 bg-white text-left shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
                          {suggestions.length > 0 ? (
                          suggestions.map((item) => {
                            const active = selectedModel?.id === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedModel(item);
                                  setModelQuery(item.label);
                                }}
                                className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition ${
                                  active
                                    ? "bg-[rgba(232,242,255,0.85)] font-semibold text-brand"
                                    : "hover:bg-background"
                                }`}
                              >
                                <span>{item.label}</span>
                                <span className="text-xs text-muted">
                                  {getCategoryLabel(item.category)}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-5 py-3 text-sm text-muted">
                            {searchLoading
                              ? "Looking up models..."
                              : "No matching sample devices found yet. Try one of the example models above."}
                          </div>
                        )}
                        </div>
                      ) : null}
                    </form>
                  </div>
                </SlideFrame>

                <SlideFrame>
                  <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                    <div className="rounded-[36px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                      <SmallLabel>Offer summary</SmallLabel>
                      <div className="mt-4 text-4xl font-semibold tracking-tight text-brand">
                        {quote ? formatCurrency(quote.cashOfferGbp) : "£0"}
                      </div>
                      <div className="mt-4 text-sm leading-6 text-muted">
                        Device: {quote?.brand} {quote?.model}
                        <br />
                        Condition: {quote ? conditionLabels[quote.condition] : "-"}
                        <br />
                        You asked for:{" "}
                        {quote ? formatCurrency(quote.requestedAmountGbp) : "-"}
                      </div>
                      <div className="mt-6 rounded-3xl bg-[#f6f8fc] p-5 text-sm leading-6 text-muted">
                        {quote?.flowMode === "auto_accept_with_bonus"
                          ? "Your requested amount is within our system maximum, so we can accept that request and move you into the bonus-prize step."
                          : "Your requested amount is above our system maximum, so this quote is capped to the best cash offer we can make today. You can now try the bonus-prize step for extra value."}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[36px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                      <Confetti />
                      <SmallLabel>
                        {quote?.flowMode === "auto_accept_with_bonus"
                          ? "Requested amount accepted"
                          : "Offer capped at system maximum"}
                      </SmallLabel>
                      <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                        {quote?.flowMode === "auto_accept_with_bonus"
                          ? "Good news. We can meet your requested price."
                          : "Your request was above our current maximum."}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                        {quote?.flowMode === "auto_accept_with_bonus"
                          ? "We have accepted the amount you asked for. The next step is the optional mini-game where the customer can still win bonus prizes before checkout."
                          : "We are showing the true system maximum for this model and condition. The next step is the mini-game rescue flow so the customer can still try to win extra prize value."}
                      </p>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => moveToStep(2)}
                          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,106,252,0.22)] transition hover:bg-brand-dark"
                        >
                          {quote?.flowMode === "auto_accept_with_bonus"
                            ? "Continue to bonus game"
                            : "Play for extra prizes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveToStep(0)}
                          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-background"
                        >
                          Edit device details
                        </button>
                      </div>
                    </div>
                  </div>
                </SlideFrame>

                <SlideFrame>
                  <div className="mx-auto grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[1fr_0.95fr]">
                    <div className="rounded-[36px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                      <SmallLabel>Bonus mini-game</SmallLabel>
                      <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                        {quote?.flowMode === "auto_accept_with_bonus"
                          ? "Spin for bonus prizes on top of your accepted quote"
                          : "Spin for extra value on top of the system maximum"}
                      </h2>
                      <p className="mt-4 text-base leading-7 text-muted">
                        Rewards are generated server-side and attached to this quote.
                        Cash bonuses increase the expected payout. Voucher rewards stay
                        separate from the device cash offer.
                      </p>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleRewardAction("play")}
                          disabled={rewardLoading}
                          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,106,252,0.22)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-65"
                        >
                          {rewardLoading ? "Spinning..." : "Play now"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRewardAction("skip")}
                          disabled={rewardLoading}
                          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-65"
                        >
                          Skip bonus and continue
                        </button>
                      </div>
                    </div>

                    <div className="relative flex justify-center">
                      <div className="relative flex h-[320px] w-[320px] items-center justify-center rounded-full border-[18px] border-brand bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                        <div className="absolute inset-6 rounded-full border border-dashed border-brand/30" />
                        <div className="absolute left-1/2 top-[-8px] h-8 w-8 -translate-x-1/2 rounded-full bg-brand shadow-[0_10px_30px_rgba(0,106,252,0.25)]" />
                        <div className="grid h-[230px] w-[230px] grid-cols-2 grid-rows-2 gap-3 rounded-full">
                          {["£5 cash", "£10 cash", "£15 voucher", "£20 cash"].map((label) => (
                            <div
                              key={label}
                              className="flex items-center justify-center rounded-full bg-[rgba(232,242,255,0.72)] px-4 text-center text-sm font-semibold text-brand"
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SlideFrame>

                <SlideFrame alignTop>
                  <div className="mx-auto w-full max-w-6xl rounded-[36px] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
                      <div className="space-y-4">
                        <div className="rounded-[28px] bg-[#f6f8fc] p-6">
                          <SmallLabel>Final trade summary</SmallLabel>
                          <div className="mt-4 space-y-3 text-sm text-muted">
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                              <span>Device</span>
                              <span className="font-semibold text-foreground">
                                {quote?.brand} {quote?.model}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                              <span>Condition</span>
                              <span className="font-semibold text-foreground">
                                {quote ? conditionLabels[quote.condition] : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                              <span>Cash offer</span>
                              <span className="font-semibold text-foreground">
                                {quote ? formatCurrency(quote.cashOfferGbp) : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                              <span>Bonus reward</span>
                              <span className="font-semibold text-foreground">
                                {quote?.reward ? quote.reward.label : "Not selected"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                              <span>Cash total before postage</span>
                              <span className="font-semibold text-brand">
                                {formatCurrency(cashWithReward)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {trade ? (
                          <div className="relative overflow-hidden rounded-[28px] bg-brand p-6 text-white">
                            <Confetti />
                            <SmallLabel>Trade confirmed</SmallLabel>
                            <div className="mt-3 text-2xl font-semibold tracking-tight">
                              Reference {trade.tradeReferenceId}
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-white/90">
                              <div>
                                Expected payout after receipt:{" "}
                                <span className="font-semibold text-white">
                                  {formatCurrency(trade.expectedPayoutOnReceiptGbp)}
                                </span>
                              </div>
                              <div>
                                Postage reimbursement:{" "}
                                <span className="font-semibold text-white">
                                  {formatCurrency(trade.postageReimbursementGbp)}
                                </span>
                              </div>
                              <div>
                                Chosen service:{" "}
                                <span className="font-semibold text-white">
                                  {trade.postageService}
                                </span>
                              </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-3">
                              {carrierPortalLink ? (
                                <a
                                  href={carrierPortalLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand"
                                >
                                  Open {trade.postageService} business portal
                                </a>
                              ) : null}
                              <button
                                type="button"
                                onClick={resetJourney}
                                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
                              >
                                Start another quote
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {trade ? (
                        <div className="rounded-[28px] bg-[#f6f8fc] p-6">
                          <SmallLabel>Next steps</SmallLabel>
                          <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
                            <p>
                              Pack the device safely, remove activation locks, and use
                              your chosen postage service to send it to Mobile Arcade.
                            </p>
                            <p>
                              Once the phone arrives and passes inspection, the postage
                              amount you entered is added back to the final payout so
                              the posting journey stays free for the customer overall.
                            </p>
                            <p>
                              When you are ready for live carrier journeys later, this
                              step can redirect straight into Evri or Royal Mail business
                              pages without changing the core quote logic.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleConfirmTrade}
                          className="max-h-[calc(100vh-260px)] space-y-4 overflow-y-auto rounded-[28px] bg-[#f6f8fc] p-6"
                        >
                          <SmallLabel>Contact, payout and self-post details</SmallLabel>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Full name
                              </label>
                              <input
                                value={customerName}
                                onChange={(event) => setCustomerName(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Email
                              </label>
                              <input
                                type="email"
                                value={customerEmail}
                                onChange={(event) => setCustomerEmail(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Mobile
                              </label>
                              <input
                                value={customerMobile}
                                onChange={(event) => setCustomerMobile(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Postage service
                              </label>
                              <select
                                value={postageService}
                                onChange={(event) => setPostageService(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              >
                                {postageServices.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {postageService === "Other" ? (
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Your postage service
                              </label>
                              <input
                                value={customPostageService}
                                onChange={(event) =>
                                  setCustomPostageService(event.target.value)
                                }
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                          ) : null}

                          <div>
                            <label className="text-xs font-semibold text-muted">
                              Collection / return address
                            </label>
                            <textarea
                              value={collectionAddress}
                              onChange={(event) => setCollectionAddress(event.target.value)}
                              rows={3}
                              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Account name
                              </label>
                              <input
                                value={bankAccountName}
                                onChange={(event) => setBankAccountName(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Sort code
                              </label>
                              <input
                                value={bankSortCode}
                                onChange={(event) => setBankSortCode(event.target.value)}
                                placeholder="12-34-56"
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Account number
                              </label>
                              <input
                                value={bankAccountNumber}
                                onChange={(event) => setBankAccountNumber(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Tracking reference
                              </label>
                              <input
                                value={postageTrackingReference}
                                onChange={(event) =>
                                  setPostageTrackingReference(event.target.value)
                                }
                                placeholder="Optional"
                                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted">
                                Expected postage cost
                              </label>
                              <div className="mt-2 flex h-12 items-center rounded-2xl border border-black/10 bg-white px-4">
                                <span className="text-sm font-semibold text-muted">£</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={estimatedPostageCost}
                                  onChange={(event) =>
                                    setEstimatedPostageCost(event.target.value)
                                  }
                                  className="w-full bg-transparent px-2 text-sm font-semibold outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-muted">
                            The postage amount entered here is stored as a reimbursement
                            and added back to the quote after Mobile Arcade receives the
                            device, so the customer effectively posts for free.
                          </div>

                          <label className="flex items-start gap-3 text-sm leading-6 text-muted">
                            <input
                              type="checkbox"
                              checked={termsAccepted}
                              onChange={(event) => setTermsAccepted(event.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-black/20"
                            />
                            <span>
                              I accept the{" "}
                              <a
                                href="https://mobilearcadeltd.co.uk/terms"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-brand"
                              >
                                Terms & Conditions
                              </a>{" "}
                              and have reviewed the{" "}
                              <a
                                href="https://mobilearcadeltd.co.uk/privacy"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-brand"
                              >
                                Privacy Policy
                              </a>
                              .
                            </span>
                          </label>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="submit"
                              disabled={confirmLoading}
                              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,106,252,0.22)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-65"
                            >
                              {confirmLoading
                                ? "Confirming..."
                                : "Confirm selling device"}
                            </button>
                            <button
                              type="button"
                              onClick={() => moveToStep(2)}
                              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-background"
                            >
                              Back to bonus step
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </SlideFrame>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12">
          <div className="relative overflow-hidden rounded-[30px] bg-brand px-8 py-10 text-white shadow-[0_24px_70px_rgba(0,106,252,0.25)] sm:px-12">
            <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="max-w-sm text-4xl font-semibold leading-[1.05] tracking-tight">
                  {cfg.promoTitle}
                  <br />
                  {cfg.promoSubtitle}
                </div>
                <a
                  href="#hero-flow"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand"
                >
                  {cfg.promoCtaLabel}
                </a>
              </div>
              <div className="relative mx-auto h-[240px] w-full max-w-[420px]">
                <Image
                  src={cfg.promoImageUrl}
                  alt="Trade-in devices"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 top-[-80px] h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          </div>
        </Container>
      </section>

      <section className="bg-[#e9ebef]">
        <Container className="py-16">
          <div className="text-center">
            <h2 className="text-5xl font-semibold tracking-tight">Three easy steps</h2>
            <p className="mt-3 text-lg text-muted">
              To turn your old device into cash
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {cfg.steps.map((item, index) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
              >
                <div className="relative h-52 bg-background">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="text-sm font-semibold text-brand">Step {index + 1}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="faqs" className="bg-white">
        <Container className="py-16">
          <h2 className="text-5xl font-semibold tracking-tight">FAQs</h2>
          <div className="mt-8 rounded-[28px] bg-white">
            {cfg.faqs.map((faq, index) => (
              <details
                key={faq.q}
                className={`group ${index === 0 ? "" : "border-t border-black/10"} py-4`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  <span>{faq.q}</span>
                  <span className="text-muted transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <footer className="bg-[#e9ebef]">
        <Container className="py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr]">
            <div>
              <Image
                src="/brand/logo-horizontal.png"
                alt="Mobile Arcade"
                width={140}
                height={30}
                className="h-6 w-auto"
              />
              <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
                Professional phone, tablet and laptop repair across Norfolk and
                Lincolnshire, with same-day service and a 6-month UK warranty.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Company</div>
              <div className="mt-4 grid gap-2 text-sm text-muted">
                <a href="#hero-flow">About us</a>
                <a href="#hero-flow">Contact us</a>
                <a href="#hero-flow">Track repair</a>
                <a href="#hero-flow">Site map</a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Services</div>
              <div className="mt-4 grid gap-2 text-sm text-muted">
                <a href="#hero-flow">iPhone repair</a>
                <a href="#hero-flow">Samsung repair</a>
                <a href="#hero-flow">Screen replacement</a>
                <a href="#hero-flow">Battery replacement</a>
                <a href="#hero-flow">Laptop repair</a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Follow us</div>
              <div className="mt-4 flex gap-3">
                {["f", "◎", "in"].map((item) => (
                  <a
                    key={item}
                    href="#hero-flow"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
            <div>© 2026 Mobile Arcade LTD. Norfolk, United Kingdom.</div>
            <div className="flex flex-wrap gap-5">
              <span>07402 192492</span>
              <span>info@mobilearcade.com</span>
              <a
                href="https://mobilearcadeltd.co.uk/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Privacy
              </a>
              <a
                href="https://mobilearcadeltd.co.uk/terms"
                target="_blank"
                rel="noreferrer"
              >
                Terms
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
