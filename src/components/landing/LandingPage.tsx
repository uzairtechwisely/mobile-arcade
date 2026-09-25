"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/landing/Celebration";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { type LandingPageConfig } from "@/lib/landing-pages";
import {
  conditionLabels,
  selectableConditions,
  formatCurrency,
  getCategoryLabel,
  POSTAGE_PACK_COST_GBP,
  REWARD_TIERS,
  storageOptionsByCategory,
  type DeviceCondition,
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
  imageUrl?: string | null;
};

type JourneyStep =
  | "model"
  | "storage"
  | "condition"
  | "review"
  | "congrats"
  | "checkout"
  | "postagePack"
  | "payout"
  | "done";

// Condenses the granular JourneyStep screens into the 5 stages shown in the
// progress strip — several screens can share one stage label.
type ProgressStage = "device" | "condition" | "value" | "checkout" | "done";

const STEP_STAGE: Record<JourneyStep, ProgressStage> = {
  model: "device",
  storage: "device",
  condition: "condition",
  review: "value",
  congrats: "value",
  checkout: "checkout",
  postagePack: "checkout",
  payout: "checkout",
  done: "done",
};

const STAGE_ORDER: ProgressStage[] = ["device", "condition", "value", "checkout", "done"];
const STAGE_LABELS: Record<ProgressStage, string> = {
  device: "Device",
  condition: "Condition",
  value: "Value",
  checkout: "Checkout",
  done: "Done",
};
// Clicking a stage in the progress strip jumps to the first screen of that stage.
const STAGE_ENTRY_STEP: Record<ProgressStage, JourneyStep> = {
  device: "model",
  condition: "condition",
  value: "review",
  checkout: "checkout",
  done: "done",
};

const devicePlaceholderSrc: Record<DeviceCategory, string> = {
  phone: "/brand/placeholders/device-phone.svg",
  tablet: "/brand/placeholders/device-tablet.svg",
  laptop: "/brand/placeholders/device-laptop.svg",
  gaming_device: "/brand/placeholders/device-gaming.svg",
};

// Real per-model photography isn't populated in the catalog yet — falls back to
// the on-brand category placeholder until image_url is set for a given model.
function getDeviceImageSrc(item: { category: DeviceCategory; imageUrl?: string | null }) {
  return item.imageUrl || devicePlaceholderSrc[item.category];
}

const deviceTypes: Array<{
  key: DeviceCategory;
  label: string;
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
}> = [
  { key: "phone", label: "Phones", iconSrc: "/brand/icons/devices-repair/mobile-icon.png", iconWidth: 16, iconHeight: 22 },
  { key: "laptop", label: "Laptop", iconSrc: "/brand/icons/devices-repair/laptop-icon.png", iconWidth: 24, iconHeight: 24 },
  { key: "tablet", label: "Tablets/iPad", iconSrc: "/brand/icons/devices-repair/tab-icon.png", iconWidth: 24, iconHeight: 26 },
  { key: "gaming_device", label: "Gaming", iconSrc: "/brand/icons/devices-repair/game-icon.png", iconWidth: 28, iconHeight: 28 },
];

const featuredDevicePicks: Record<DeviceCategory, DeviceSuggestion[]> = {
  phone: [
    { id: "apple-iphone-16-pro", brand: "Apple", model: "iPhone 16 Pro", category: "phone", label: "Apple iPhone 16 Pro" },
    { id: "apple-iphone-15-pro-max", brand: "Apple", model: "iPhone 15 Pro Max", category: "phone", label: "Apple iPhone 15 Pro Max" },
    { id: "apple-iphone-15", brand: "Apple", model: "iPhone 15", category: "phone", label: "Apple iPhone 15" },
    { id: "samsung-galaxy-s24-ultra", brand: "Samsung", model: "Galaxy S24 Ultra", category: "phone", label: "Samsung Galaxy S24 Ultra" },
    { id: "samsung-galaxy-z-flip-6", brand: "Samsung", model: "Galaxy Z Flip 6", category: "phone", label: "Samsung Galaxy Z Flip 6" },
  ],
  laptop: [
    { id: "apple-macbook-air-m2", brand: "Apple", model: "MacBook Air M2", category: "laptop", label: "Apple MacBook Air M2" },
    { id: "apple-macbook-pro-14", brand: "Apple", model: "MacBook Pro 14", category: "laptop", label: "Apple MacBook Pro 14" },
    { id: "dell-xps-13", brand: "Dell", model: "XPS 13", category: "laptop", label: "Dell XPS 13" },
  ],
  tablet: [
    { id: "apple-ipad-air-5", brand: "Apple", model: "iPad Air 5", category: "tablet", label: "Apple iPad Air 5" },
    { id: "apple-ipad-10", brand: "Apple", model: "iPad 10th Gen", category: "tablet", label: "Apple iPad 10th Gen" },
    { id: "samsung-tab-s9", brand: "Samsung", model: "Galaxy Tab S9", category: "tablet", label: "Samsung Galaxy Tab S9" },
  ],
  gaming_device: [
    { id: "sony-ps5", brand: "Sony", model: "PlayStation 5", category: "gaming_device", label: "Sony PlayStation 5" },
    { id: "microsoft-xbox-series-x", brand: "Microsoft", model: "Xbox Series X", category: "gaming_device", label: "Microsoft Xbox Series X" },
    { id: "nintendo-switch-oled", brand: "Nintendo", model: "Switch OLED", category: "gaming_device", label: "Nintendo Switch OLED" },
  ],
};

const conditionDescriptions: Record<DeviceCondition, string> = {
  brand_new: "Unused, in original packaging with all accessories.",
  excellent: "Fully working with very light signs of use.",
  good: "Fully working with visible everyday wear.",
  fair: "Working but with heavier cosmetic wear.",
  cracked_working: "Cracked screen, body damage or a fault.",
  cracked_not_working: "Cracked screen, body damage or a fault.",
};


function getModelStepTitle(category: DeviceCategory) {
  if (category === "phone") return "Which phone are you trading in?";
  if (category === "laptop") return "Which laptop are you trading in?";
  if (category === "tablet") return "Which tablet are you trading in?";
  return "Which gaming device are you trading in?";
}

function getFindValueCtaLabel(category: DeviceCategory) {
  if (category === "phone") return "Find my phone value";
  if (category === "laptop") return "Find my laptop value";
  if (category === "tablet") return "Find my tablet/iPad value";
  return "Find my gaming device value";
}

const PROMO_LAPTOP = "/brand/photos/promo-laptop.webp";
const PROMO_TABLET = "/brand/photos/promo-tablets.webp";
const PROMO_GAMING = "/brand/placeholders/promo.svg";

function getPromoContent(category: DeviceCategory, cfg: LandingPageConfig) {
  if (category === "laptop") {
    return {
      title: "Get £100-£600",
      subtitle: "when you trade in with us",
      ctaLabel: getFindValueCtaLabel(category),
      imageUrl: PROMO_LAPTOP,
    };
  }
  if (category === "tablet") {
    return {
      title: "Get £80-£550",
      subtitle: "when you trade in with us",
      ctaLabel: getFindValueCtaLabel(category),
      imageUrl: PROMO_TABLET,
    };
  }
  if (category === "gaming_device") {
    return {
      title: "Get £50-£350",
      subtitle: "when you trade in with us",
      ctaLabel: getFindValueCtaLabel(category),
      imageUrl: PROMO_GAMING,
    };
  }
  return {
    title: cfg.promoTitle,
    subtitle: cfg.promoSubtitle,
    ctaLabel: cfg.promoCtaLabel,
    imageUrl: cfg.promoImageUrl,
  };
}

function TradeInProgress({ step, onNavigate }: { step: JourneyStep; onNavigate: (step: JourneyStep) => void }) {
  const activeStage = STEP_STAGE[step];
  const activeIndex = STAGE_ORDER.indexOf(activeStage);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeStage]);

  return (
    <div className="tradein-progress">
      {STAGE_ORDER.map((stage, i) => {
        const active = stage === activeStage;
        const reached = i <= activeIndex;
        return (
          <button
            key={stage}
            type="button"
            ref={active ? activeRef : undefined}
            disabled={!reached}
            onClick={() => onNavigate(STAGE_ENTRY_STEP[stage])}
            aria-current={active ? "step" : undefined}
            className={`tradein-progress-step ${reached ? "is-active" : ""} ${active ? "current" : ""}`}
          >
            <span className="tradein-progress-dot" />
            <span>{STAGE_LABELS[stage]}</span>
          </button>
        );
      })}
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{children}</div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function LogoOnlyHeader() {
  return (
    <header className="ma-header">
      <Image
        src="/brand/logo-horizontal.png"
        alt="Mobile Arcade"
        width={900}
        height={135}
        className="ma-header-logo"
        priority
      />
    </header>
  );
}

function HeroIntro({ cfg }: { cfg: LandingPageConfig }) {
  return (
    <section className="landing-hero">
      <div className="landing-hero-inner">
        <h1>{cfg.heroTitle}</h1>
        <p>{cfg.heroSubtitle}</p>
      </div>
    </section>
  );
}

function DeviceCategorySelector({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: DeviceCategory;
  onSelect: (category: DeviceCategory) => void;
}) {
  return (
    <section className="device-category-section" id="device-search">
      <h2 className="device-category-title">What device would you like to trade in?</h2>
      <div className="device-category-list">
        {deviceTypes.map((item) => {
          const active = selectedCategory === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`device-category ${active ? "is-selected text-[#006AFC]" : "text-[#1D1D1F]"}`}
            >
              <span className="flex h-12 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="device-icon"
                  style={{
                    width: item.iconWidth,
                    height: item.iconHeight,
                    WebkitMaskImage: `url(${item.iconSrc})`,
                    maskImage: `url(${item.iconSrc})`,
                  }}
                />
              </span>
              <span className="device-category-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TradeInPromoCard({
  category,
  cfg,
  onCta,
}: {
  category: DeviceCategory;
  cfg: LandingPageConfig;
  onCta: () => void;
}) {
  const content = getPromoContent(category, cfg);
  const [promoLead, ...promoTail] = content.title.replace("–", "-").split(" ");
  const promoRest = promoTail.join(" ");
  const mobileImageUrl = content.imageUrl.endsWith(".webp")
    ? content.imageUrl.replace(".webp", "-mobile.webp")
    : content.imageUrl;
  return (
    <section className="tradein-promo-section">
      <div className="tradein-promo">
        <div className="tradein-promo-copy">
          <h2 className="tradein-promo-title">
            {promoLead} <strong>{promoRest}</strong>
            <br />
            {content.subtitle}
          </h2>
          <button type="button" onClick={onCta} className="tradein-promo-cta">
            {content.ctaLabel}
          </button>
        </div>
        {/* Portrait (rotated) art on mobile so the devices show whole, landscape art on desktop */}
        <Image
          key={`${content.imageUrl}-m`}
          src={mobileImageUrl}
          alt="Trade-in devices"
          width={675}
          height={900}
          className="tradein-promo-image tradein-promo-image-mobile"
        />
        <Image
          key={content.imageUrl}
          src={content.imageUrl}
          alt=""
          width={420}
          height={315}
          className="tradein-promo-image tradein-promo-image-desktop"
        />
      </div>
    </section>
  );
}

function ProcessStepCard({
  index,
  title,
  body,
  imageUrl,
}: {
  index: number;
  title: string;
  body: string;
  imageUrl: string;
}) {
  return (
    <article className="step-card">
      <Image src={imageUrl} alt={title} width={378} height={187} className="step-card-image" />
      <div className="step-card-content">
        <p className="step-number">Step {index + 1}</p>
        <h3 className="step-title">{title}</h3>
        <p className="step-description">{body}</p>
      </div>
    </article>
  );
}

function FAQAccordion({
  faqs,
  openIndex,
  onToggle,
}: {
  faqs: LandingPageConfig["faqs"];
  openIndex: number;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="faq-section">
      <div className="faq-inner">
        <h2 className="faq-title">FAQs</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const open = index === openIndex;
            return (
              <div key={faq.q} className={`faq-item ${open ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => onToggle(index)}
                  aria-expanded={open}
                >
                  <span>{faq.q}</span>
                  <span className="shrink-0 text-[#1D1D1F]">
                    <AppIcon name="navigation/chevron-down" className={`transition-transform ${open ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {open ? <div className="faq-answer">{faq.a}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AppIcon({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  const src = `/brand/icons/${name}.png`;
  return (
    <span
      aria-hidden="true"
      className={`device-icon ${className}`}
      style={{ width: size, height: size, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
  );
}

function FooterSocialIcon({ kind }: { kind: "facebook" | "instagram" | "linkedin" }) {
  if (kind === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M13.2 20v-7h2.2l.4-2.8h-2.6V8.4c0-.8.2-1.4 1.4-1.4H16V4.5c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v1.9H9v2.8h2.4v7h1.8Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (kind === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="17" cy="7" r="1" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M7.5 9.5V17M7.5 6.8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM11 17v-4.3c0-1.8 1-3 2.6-3 1.5 0 2.4 1 2.4 2.8V17"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MobileArcadeFooter() {
  return (
    <footer className="ma-footer">
      <div className="ma-footer-inner">
        <div>
          <Image
            src="/brand/logo-horizontal.png"
            alt="Mobile Arcade"
            width={900}
            height={135}
            className="ma-footer-logo"
          />
          <p className="ma-footer-description">
            Professional phone, tablet and laptop repair across Norfolk, Suffolk and Lincolnshire.
            Established 2010 with same-day service and a 6-month UK warranty.
          </p>
        </div>

        <div className="footer-group">
          <h3 className="footer-heading">Company</h3>
          <div className="footer-links">
            <a href="#device-search" className="footer-link">About us</a>
            <a href="#device-search" className="footer-link">Contact us</a>
            <a href="#device-search" className="footer-link">Track repair</a>
            <a href="#device-search" className="footer-link">Site map</a>
          </div>
        </div>

        <div className="footer-group">
          <h3 className="footer-heading">Services</h3>
          <div className="footer-links">
            <a href="#device-search" className="footer-link">iPhone repair</a>
            <a href="#device-search" className="footer-link">Samsung repair</a>
            <a href="#device-search" className="footer-link">Screen replacement</a>
            <a href="#device-search" className="footer-link">Battery replacement</a>
            <a href="#device-search" className="footer-link">Laptop repair</a>
          </div>
        </div>

        <div className="footer-group">
          <h3 className="footer-heading">Follow us</h3>
          <div className="footer-socials">
            {(["facebook", "instagram", "linkedin"] as const).map((item) => (
              <a key={item} href="#device-search" className="footer-social" aria-label={item}>
                <FooterSocialIcon kind={item} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom md:col-span-full">
          <div className="footer-contact">
            <span>07402 192492</span>
            <span>info@mobilearcade.com</span>
            <a href="https://mobilearcadeltd.co.uk/privacy" target="_blank" rel="noreferrer" className="footer-link">
              Privacy
            </a>
            <a href="https://mobilearcadeltd.co.uk/terms" target="_blank" rel="noreferrer" className="footer-link">
              Terms
            </a>
          </div>
          <div className="footer-copyright">© 2026 Mobile Arcade LTD. Norfolk, United Kingdom.</div>
        </div>
      </div>
    </footer>
  );
}

type SupportReason = "typing_error" | "unsupported_device" | "system_down";
type SupportModalState = {
  title: string;
  message: string;
  reason: SupportReason;
  showLeadForm: boolean;
};

async function parseJsonResponse<T>(response: Response): Promise<T & { error?: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("SYSTEM_NON_JSON_RESPONSE");
  }

  if (!text) {
    return {} as T & { error?: string };
  }

  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    throw new Error("SYSTEM_INVALID_JSON_RESPONSE");
  }
}

async function postJson<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonResponse<T>(response);

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data;
}

function resolveSupportModal(error: unknown): SupportModalState {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  if (message.includes("Selected model was not found") || message.includes("No matching devices found")) {
    return {
      title: "We do not yet buy this device",
      message:
        "We will likely add it soon. Leave your name, email and phone and we will call you with an accurate quote when we can support it.",
      reason: "unsupported_device",
      showLeadForm: true,
    };
  }

  if (message.includes("SYSTEM_") || message.includes("Unexpected token") || message.includes("Failed to fetch")) {
    return {
      title: "Our quoting system is temporarily unavailable",
      message:
        "You can still get up to £800. Leave your name, email and phone and we will call you with an accurate quote while the system is down.",
      reason: "system_down",
      showLeadForm: true,
    };
  }

  return {
    title: "Please select a phone or keep typing",
    message:
      "There was an error matching what you typed. Please choose a device from the dropdown list or keep typing to filter the results.",
    reason: "typing_error",
    showLeadForm: false,
  };
}

const SPIN_SEGMENT_ANGLE = 360 / REWARD_TIERS.length;
const SPIN_SEGMENT_COLORS = ["#006AFC", "#EAEBEF"];
const SPIN_WHEEL_SIZE = 288;
const SPIN_WHEEL_RADIUS = SPIN_WHEEL_SIZE / 2;
// The pointer sits at the 3 o'clock edge of the wheel (not the top), so the
// winning segment should land at 90° rather than 0°.
const SPIN_POINTER_ANGLE = 90;

function getRewardTierLabel(tier: (typeof REWARD_TIERS)[number]) {
  if (tier.isCash) return `£${tier.valueGbp}`;
  if (tier.type === "mystery_bag") return "Mystery";
  return `£${tier.valueGbp}`;
}

// angle: degrees clockwise from 12 o'clock, matching how the wheel's own
// rotation is expressed elsewhere in this file.
function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeWedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, r, startAngle);
  const end = polarPoint(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function SpinWheelSvg({ rotation }: { rotation: number }) {
  const cx = SPIN_WHEEL_RADIUS;
  const cy = SPIN_WHEEL_RADIUS;
  return (
    <svg
      viewBox={`0 0 ${SPIN_WHEEL_SIZE} ${SPIN_WHEEL_SIZE}`}
      width={SPIN_WHEEL_SIZE}
      height={SPIN_WHEEL_SIZE}
      className="spin-wheel"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {REWARD_TIERS.map((tier, i) => {
        const startAngle = i * SPIN_SEGMENT_ANGLE;
        const endAngle = startAngle + SPIN_SEGMENT_ANGLE;
        const labelPoint = polarPoint(cx, cy, SPIN_WHEEL_RADIUS * 0.62, startAngle + SPIN_SEGMENT_ANGLE / 2);
        return (
          <g key={tier.label}>
            <path
              d={describeWedgePath(cx, cy, SPIN_WHEEL_RADIUS, startAngle, endAngle)}
              fill={SPIN_SEGMENT_COLORS[i % 2]}
              stroke="#000000"
              strokeWidth={1}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              transform={`rotate(${startAngle + SPIN_SEGMENT_ANGLE / 2}, ${labelPoint.x}, ${labelPoint.y})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--ma-font-display)"
              fontSize={22}
              fontWeight={500}
              fill="#1D1D1F"
            >
              {getRewardTierLabel(tier)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LandingPage({ cfg }: { cfg: LandingPageConfig }) {
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>("phone");
  const [showJourney, setShowJourney] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [modelQuery, setModelQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<DeviceSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<DeviceSuggestion[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<JourneyStep>("condition");
  const [condition, setCondition] = useState<DeviceCondition>("good");
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [spinOpen, setSpinOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [rewardRevealed, setRewardRevealed] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [spinError, setSpinError] = useState<string | null>(null);

  const [hasOwnPackaging, setHasOwnPackaging] = useState<boolean | null>(null);
  const [postagePackLoading, setPostagePackLoading] = useState(false);
  const [postagePackPaymentIntentId, setPostagePackPaymentIntentId] = useState<string | null>(null);
  const [postagePackError, setPostagePackError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankSortCode, setBankSortCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [trade, setTrade] = useState<TradeConfirmation | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [supportModal, setSupportModal] = useState<SupportModalState | null>(null);
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMobile, setSupportMobile] = useState("");
  const [supportSubmitLoading, setSupportSubmitLoading] = useState(false);
  const [supportSuccessMessage, setSupportSuccessMessage] = useState<string | null>(null);
  const [supportFormError, setSupportFormError] = useState<string | null>(null);

  // Resume after a Stripe Checkout redirect: the browser fully navigates away and
  // back, so React state is gone — the pending quote/address are restored from
  // sessionStorage, keyed off the query params Stripe redirects back with.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postagePackResult = params.get("postage_pack");
    if (!postagePackResult) return;

    const restoredQuoteRaw = window.sessionStorage.getItem("ma_pending_quote");
    const restoredAddress = window.sessionStorage.getItem("ma_pending_address") ?? "";
    const restoredQuote = restoredQuoteRaw ? (JSON.parse(restoredQuoteRaw) as QuoteSummary) : null;

    window.history.replaceState(null, "", window.location.pathname);

    if (!restoredQuote) return;

    // Restoring funnel state after a full-page redirect back from Stripe Checkout —
    // deferred a tick so these don't fire as synchronous setState-in-effect.
    queueMicrotask(() => {
      setQuote(restoredQuote);
      setDeviceCategory(restoredQuote.category);
      setCondition(restoredQuote.condition);
      setSelectedStorage(restoredQuote.storageOption);
      setCollectionAddress(restoredAddress);
      setHasOwnPackaging(false);
      setShowJourney(true);

      if (postagePackResult === "success") {
        const sessionId = params.get("session_id");
        if (sessionId) {
          fetch(`/api/trade/postage-pack?session_id=${encodeURIComponent(sessionId)}`)
            .then((res) => res.json())
            .then((data: { paid?: boolean; paymentIntentId?: string | null }) => {
              if (data.paid) {
                setPostagePackPaymentIntentId(data.paymentIntentId ?? sessionId);
                setStep("payout");
              } else {
                setPostagePackError("We could not confirm your postage pack payment. Please try again.");
                setStep("postagePack");
              }
            })
            .catch(() => {
              setPostagePackError("We could not confirm your postage pack payment. Please try again.");
              setStep("postagePack");
            });
        }
      } else {
        setStep("postagePack");
      }
    });
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const query = encodeURIComponent(modelQuery.trim());
        const response = await fetch(`/api/trade/models?category=${deviceCategory}&query=${query}`, {
          signal: controller.signal,
        });
        const data = await parseJsonResponse<{ models?: DeviceSuggestion[]; error?: string }>(response);

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load devices.");
        }

        setSuggestions(data.models ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions(featuredDevicePicks[deviceCategory]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deviceCategory, dropdownOpen, modelQuery]);

  const storageChoices = storageOptionsByCategory[deviceCategory];

  // Every step transition should land the user at the top of the new screen,
  // not wherever they happened to be scrolled to on the previous one.
  useEffect(() => {
    if (!showJourney) return;
    document.getElementById("trade-journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, showJourney]);

  function openSupportModal(error: unknown) {
    setSupportSuccessMessage(null);
    setSupportFormError(null);
    setSupportModal(resolveSupportModal(error));
  }

  function resetJourney() {
    setStep("model");
    setQuote(null);
    setTrade(null);
    setSelectedModel(null);
    setSelectedStorage(null);
    setEditOpen(false);
    setModelQuery("");
    setSuggestions([]);
    setRequestedAmount("");
    setCondition("good");
    setSpinOpen(false);
    setSpinning(false);
    setRewardRevealed(false);
    setSpinError(null);
    setHasOwnPackaging(null);
    setPostagePackPaymentIntentId(null);
    setPostagePackError(null);
    setConfirmError(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerMobile("");
    setCollectionAddress("");
    setBankAccountName("");
    setBankSortCode("");
    setBankAccountNumber("");
    setTermsAccepted(false);
    setSupportModal(null);
    setSupportSuccessMessage(null);
    setSupportFormError(null);
    window.sessionStorage.removeItem("ma_pending_quote");
    window.sessionStorage.removeItem("ma_pending_address");
  }

  function cancelJourney() {
    resetJourney();
    setShowJourney(false);
  }

  function startFunnelForCategory(category: DeviceCategory) {
    setDeviceCategory(category);
    resetJourney();
    setSuggestions(featuredDevicePicks[category]);
    setShowJourney(true);
    window.setTimeout(() => {
      document.getElementById("trade-journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function selectModelSuggestion(item: DeviceSuggestion) {
    setSelectedModel(item);
    setModelQuery(item.label);
    setSuggestions([]);
    setDropdownOpen(false);
  }

  function resolveModelMatch(): DeviceSuggestion | null {
    if (selectedModel) return selectedModel;

    const normalizedQuery = modelQuery.trim().toLowerCase();
    if (!normalizedQuery) return null;

    const mergedCandidates = [...suggestions, ...featuredDevicePicks[deviceCategory]].filter(
      (item, index, list) => list.findIndex((entry) => entry.id === item.id) === index,
    );

    return (
      mergedCandidates.find((item) => {
        const fullLabel = item.label.toLowerCase();
        const modelOnly = item.model.toLowerCase();
        return (
          fullLabel === normalizedQuery ||
          modelOnly === normalizedQuery ||
          `${item.brand} ${item.model}`.toLowerCase() === normalizedQuery
        );
      }) ?? null
    );
  }

  function continueFromModelStep() {
    const matched = resolveModelMatch();
    if (!matched) {
      openSupportModal(
        new Error(modelQuery.trim() ? "No matching devices found." : "Please choose a model from the suggestions first."),
      );
      return;
    }

    selectModelSuggestion(matched);
    setStep("storage");
  }

  // Progress-strip labels only allow jumping back to a stage already reached
  // (enforced in TradeInProgress itself); this just closes any open overlay
  // so a jump never leaves a stale modal on screen.
  function navigateToStep(target: JourneyStep) {
    setSpinOpen(false);
    setEditOpen(false);
    setStep(target);
  }

  // Single source of truth for the previous screen in the journey, used by
  // the shared top-bar back button. null means there's nothing to go back to.
  function getPreviousStep(current: JourneyStep): JourneyStep | null {
    switch (current) {
      case "model":
        return null;
      case "storage":
        return "model";
      case "condition":
        return "storage";
      case "review":
        return "condition";
      case "congrats":
        return "review";
      case "checkout":
        return "congrats";
      case "postagePack":
        return "checkout";
      case "payout":
        return hasOwnPackaging ? "checkout" : "postagePack";
      case "done":
        return null;
    }
  }

  function handleBack() {
    const previous = getPreviousStep(step);
    if (previous) navigateToStep(previous);
  }

  async function submitAmount(mode: "unsure" | "sell") {
    if (!selectedModel) return;

    let amount: number | undefined;
    if (mode === "sell" && requestedAmount.trim()) {
      const parsedAmount = Number(requestedAmount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        openSupportModal(new Error("Enter how much you want in GBP, or choose 'I am not sure'."));
        return;
      }
      amount = parsedAmount;
    }

    setQuoteLoading(true);
    try {
      const data = await postJson<{ quote: QuoteSummary }>("/api/trade/quote", {
        category: deviceCategory,
        deviceModelId: selectedModel.id,
        condition,
        storageOption: selectedStorage ?? undefined,
        requestedAmountGbp: amount,
      });
      setQuote(data.quote);
      setStep("congrats");
    } catch (error) {
      openSupportModal(error);
    } finally {
      setQuoteLoading(false);
    }
  }

  function startSpin() {
    setSpinOpen(true);
    setRewardRevealed(false);
  }

  async function playSpin() {
    if (!quote || spinning) return;
    setSpinning(true);
    setRewardLoading(true);
    setSpinError(null);
    try {
      const data = await postJson<{ quote: QuoteSummary }>("/api/trade/reward", {
        quoteId: quote.id,
        action: "play",
      });
      const reward = data.quote.reward;
      const segmentIndex = Math.max(
        0,
        REWARD_TIERS.findIndex((tier) => tier.type === reward?.type && tier.label === reward?.label),
      );
      const segmentCenter = segmentIndex * SPIN_SEGMENT_ANGLE + SPIN_SEGMENT_ANGLE / 2;
      const fullSpins = 6 * 360;
      const target = fullSpins + (((SPIN_POINTER_ANGLE - segmentCenter) % 360) + 360) % 360;

      setSpinRotation(target);
      window.setTimeout(() => {
        setQuote(data.quote);
        setSpinning(false);
        setRewardRevealed(true);
      }, 4300);
    } catch (error) {
      setSpinning(false);
      setSpinError(error instanceof Error ? error.message : "Unable to spin right now. Please try again.");
    } finally {
      setRewardLoading(false);
    }
  }

  function continueAfterReward() {
    setSpinOpen(false);
    setStep("checkout");
  }

  async function choosePackaging(ownsPackaging: boolean) {
    setHasOwnPackaging(ownsPackaging);
    setPostagePackError(null);
    setStep(ownsPackaging ? "payout" : "postagePack");
  }

  async function startPostagePackCheckout() {
    if (!quote) return;
    if (!collectionAddress.trim()) {
      setPostagePackError("Please enter the address the postage pack should be sent to.");
      return;
    }

    setPostagePackError(null);
    setPostagePackLoading(true);
    try {
      window.sessionStorage.setItem("ma_pending_quote", JSON.stringify(quote));
      window.sessionStorage.setItem("ma_pending_address", collectionAddress);

      const data = await postJson<{ checkoutUrl: string }>("/api/trade/postage-pack", {
        quoteId: quote.id,
        deviceLabel: `${quote.brand} ${quote.model}`,
        returnUrl: window.location.origin + window.location.pathname,
      });
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setPostagePackLoading(false);
      const message = error instanceof Error ? error.message : "Unable to start payment.";
      setPostagePackError(message);
    }
  }

  async function handleConfirmTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || hasOwnPackaging === null) return;

    try {
      setConfirmLoading(true);
      setConfirmError(null);
      const data = await postJson<{ trade: TradeConfirmation }>("/api/trade/confirm", {
        quoteId: quote.id,
        customerName,
        customerEmail,
        customerMobile,
        collectionAddress,
        bankAccountName,
        bankSortCode,
        bankAccountNumber,
        hasOwnPackaging,
        postagePackStripePaymentIntentId: postagePackPaymentIntentId ?? undefined,
        termsAccepted,
      });
      setTrade(data.trade);
      setStep("done");
      window.sessionStorage.removeItem("ma_pending_quote");
      window.sessionStorage.removeItem("ma_pending_address");
    } catch (error) {
      setConfirmError(
        error instanceof Error
          ? error.message
          : "We could not confirm your trade. Please check your details and try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleSupportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supportModal) return;

    try {
      setSupportSubmitLoading(true);
      setSupportSuccessMessage(null);
      setSupportFormError(null);
      await postJson<{ supportRequest: { id: string } }>("/api/trade/support-request", {
        deviceCategory,
        modelQuery,
        requestedAmountGbp: requestedAmount ? Number(requestedAmount) : undefined,
        condition,
        customerName: supportName,
        customerEmail: supportEmail,
        customerMobile: supportMobile,
        reason: supportModal.reason,
      });
      setSupportSuccessMessage(
        "Thanks. We have saved your details and a team member will contact you with an accurate quote.",
      );
    } catch {
      setSupportSuccessMessage(null);
      setSupportFormError("We could not save your details just now. Please try again.");
    } finally {
      setSupportSubmitLoading(false);
    }
  }

  const activeBrandModel = quote ? `${quote.brand} ${quote.model}` : (selectedModel?.label ?? "");

  return (
    <div className="ma-page tradein-landing relative bg-white">
      <style>{`@keyframes confetti{0%{transform:translateY(-10px) rotate(0deg);opacity:0}20%{opacity:1}100%{transform:translateY(260px) rotate(260deg);opacity:0}}`}</style>

      <Modal open={Boolean(supportModal)} onClose={() => setSupportModal(null)} title={supportModal?.title ?? "Help with your quote"}>
        <p className="text-sm leading-6 text-muted">{supportModal?.message}</p>
        {supportModal?.showLeadForm ? (
          <form onSubmit={handleSupportSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="support-name" className="text-xs font-semibold text-muted">Full name</label>
                <input
                  id="support-name"
                  value={supportName}
                  onChange={(event) => setSupportName(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
              <div>
                <label htmlFor="support-mobile" className="text-xs font-semibold text-muted">Phone</label>
                <input
                  id="support-mobile"
                  value={supportMobile}
                  onChange={(event) => setSupportMobile(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="support-email" className="text-xs font-semibold text-muted">Email</label>
              <input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(event) => setSupportEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            {supportSuccessMessage ? (
              <div className="rounded-2xl bg-[rgba(232,242,255,0.85)] px-4 py-3 text-sm text-brand">{supportSuccessMessage}</div>
            ) : null}
            {supportFormError ? (
              <div className="rounded-2xl bg-[rgba(254,242,242,1)] px-4 py-3 text-sm text-[rgba(153,27,27,1)]">{supportFormError}</div>
            ) : null}
            <Button type="submit" disabled={supportSubmitLoading}>
              {supportSubmitLoading ? "Saving..." : "Leave my details"}
            </Button>
          </form>
        ) : (
          <div className="mt-5">
            <Button type="button" onClick={() => setSupportModal(null)}>
              Try again
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit-in-place modal for the review screen's pencil icon */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Update your device details">
        <div className="space-y-6">
          <div>
            <SmallLabel>Condition</SmallLabel>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {selectableConditions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCondition(item.key)}
                  aria-pressed={condition === item.key}
                  className={`pill-choice !min-h-[44px] !px-4 !text-sm ${condition === item.key ? "is-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SmallLabel>Storage</SmallLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {storageChoices.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedStorage(option)}
                  aria-pressed={selectedStorage === option}
                  className={`pill-choice !min-h-[44px] !px-4 !text-sm ${selectedStorage === option ? "is-selected" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" onClick={() => setEditOpen(false)} className="w-full">
            Save changes
          </Button>
        </div>
      </Modal>

      <LogoOnlyHeader />
      <HeroIntro cfg={cfg} />

      <DeviceCategorySelector selectedCategory={deviceCategory} onSelect={startFunnelForCategory} />

      <TradeInPromoCard category={deviceCategory} cfg={cfg} onCta={() => startFunnelForCategory(deviceCategory)} />

      {showJourney ? (
        <section id="trade-journey" className="overflow-hidden bg-white">
          <div className="journey-close">
            {getPreviousStep(step) ? (
              <button type="button" onClick={handleBack} aria-label="Go back to the previous step" className="journey-close-btn">
                <AppIcon name="navigation/chevron-left" />
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={cancelJourney} aria-label="Cancel and close this quote" className="journey-close-btn">
              <AppIcon name="navigation/close" />
            </button>
          </div>

          <TradeInProgress step={step} onNavigate={navigateToStep} />

          <Container className="pb-[48px] pt-[8px]">
            <div className="mx-auto max-w-xl lg:max-w-none">
              {step === "model" ? (
                <div className="model-search-main mx-auto flex w-full max-w-[402px] flex-col items-center bg-white px-4 py-8 text-center">
                  <div className="flex w-full flex-col items-center gap-5">
                    <div className="model-search-heading flex w-full max-w-[320px] flex-col items-center gap-3.5">
                      <h2 className="model-search-title w-full font-sans text-[28px] font-medium leading-[28px] text-[#1D1D1F]">
                        {getModelStepTitle(deviceCategory)}
                      </h2>
                      <p className="model-search-help w-full font-sans text-[16px] font-normal leading-[19px] text-[#6E6E73]">
                        Search by brand or model to get an instant, accurate trade-in quote.
                      </p>
                    </div>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        continueFromModelStep();
                      }}
                      className="model-search-controls flex w-full max-w-[283px] flex-col items-center gap-5"
                    >
                      <label htmlFor="funnel-model-search" className="sr-only">
                        Search for your device model
                      </label>
                      <input
                        id="funnel-model-search"
                        ref={searchInputRef}
                        value={modelQuery}
                        onChange={(event) => {
                          setModelQuery(event.target.value);
                          setSelectedModel(null);
                          setDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setSuggestions(featuredDevicePicks[deviceCategory]);
                          setDropdownOpen(true);
                        }}
                        placeholder={`Search your ${getCategoryLabel(deviceCategory)}`}
                        className="device-category-search-input model-search-input w-full"
                      />

                      <Button type="submit" className="model-search-cta !rounded-full !text-base !font-medium">
                        {getFindValueCtaLabel(deviceCategory)}
                      </Button>
                    </form>

                    {dropdownOpen ? (
                      <div className="model-results">
                        {suggestions.length > 0 ? (
                          suggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={() => selectModelSuggestion(item)}
                              className="model-result"
                            >
                              <span>{item.label}</span>
                              <span className="model-result-select" aria-hidden="true">Select</span>
                            </button>
                          ))
                        ) : (
                          <div className="model-result text-[#6E6E73]">
                            {searchLoading ? "Looking up devices..." : "No matching devices yet. Keep typing or try another model."}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {step === "condition" ? (
                <div className="condition-main mx-auto flex w-full max-w-[402px] flex-col items-center gap-5 bg-white px-5 py-8 text-center">
                  <div className="condition-layout flex w-full flex-col items-center gap-5">
                    <Image
                      src={getDeviceImageSrc(selectedModel ?? { category: deviceCategory })}
                      alt={activeBrandModel || getCategoryLabel(deviceCategory)}
                      width={200}
                      height={228}
                      unoptimized
                      className="device-preview-image"
                    />

                    <div className="condition-content flex w-full flex-col items-center gap-5">
                      <div>
                        <h2 className="device-preview-name">{activeBrandModel}</h2>
                        <button type="button" onClick={() => setStep("model")} className="change-device-link">
                          Change device
                        </button>
                      </div>

                      <div className="storage-info">
                        <h3 className="storage-title">How would you describe its condition?</h3>
                        <p className="storage-help">
                          Be as accurate as you can &mdash; your final offer depends on the device matching this
                          description.
                        </p>
                      </div>

                      <div className="condition-options">
                        {selectableConditions.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setCondition(item.key)}
                            aria-pressed={condition === item.key}
                            className={`condition-option-card transition ${condition === item.key ? "is-selected" : ""}`}
                          >
                            <span className="condition-option-title">{conditionLabels[item.key]}</span>
                            <span className="condition-option-copy">{conditionDescriptions[item.key]}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex w-full flex-col gap-3">
                        <button type="button" onClick={() => setStep("review")} className="storage-continue">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "storage" ? (
                <div className="storage-main mx-auto flex w-full max-w-[402px] flex-col items-center gap-5 bg-white px-5 py-8 text-center">
                  <div className="storage-layout flex w-full flex-col items-center gap-5">
                    <Image
                      src={getDeviceImageSrc(selectedModel ?? { category: deviceCategory })}
                      alt={activeBrandModel || getCategoryLabel(deviceCategory)}
                      width={200}
                      height={228}
                      unoptimized
                      className="device-preview-image"
                    />

                    <div className="storage-content flex w-full flex-col items-center gap-5">
                      <div>
                        <h2 className="device-preview-name">{activeBrandModel}</h2>
                        <button type="button" onClick={() => setStep("model")} className="change-device-link">
                          Change device
                        </button>
                      </div>

                      <div className="storage-info">
                        <h3 className="storage-title">Confirm the exact storage size</h3>
                        <p className="storage-help">
                          Check Settings &gt; General &gt; About to confirm the storage size of your {activeBrandModel}.
                        </p>
                      </div>

                      <div className="storage-options">
                        {storageChoices.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedStorage(option)}
                            aria-pressed={selectedStorage === option}
                            className={`storage-option ${selectedStorage === option ? "is-selected" : ""}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      <div className="storage-actions flex w-full flex-col gap-3">
                        <button type="button" onClick={() => setStep("model")} className="storage-change">
                          Change device
                        </button>
                        <button
                          type="button"
                          disabled={!selectedStorage}
                          onClick={() => setStep("condition")}
                          className="storage-continue disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "review" ? (
                <div className="value-main mx-auto flex w-full max-w-[402px] flex-col items-center gap-5 bg-white px-5 py-8 text-center">
                  <div className="value-layout flex w-full flex-col items-center gap-5">
                    <div className="device-preview">
                      <div className="relative">
                        <Image
                          src={getDeviceImageSrc(selectedModel ?? { category: deviceCategory })}
                          alt={activeBrandModel || getCategoryLabel(deviceCategory)}
                          width={200}
                          height={228}
                          unoptimized
                          className="device-preview-image device-image"
                        />
                        <button
                          type="button"
                          onClick={() => setEditOpen(true)}
                          aria-label="Edit device details"
                          className="device-visual-edit"
                        >
                          <AppIcon name="operations/edit" size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="value-content flex w-full flex-col items-center gap-5">
                      <div className="selected-device-copy">
                        <h2 className="selected-device-title">Your {activeBrandModel} is selected</h2>
                        <p className="selected-device-help">We&apos;ve saved your device, storage and condition.</p>
                      </div>

                      <div className="price-info">
                        <h3 className="price-title">How much would you like to sell for?</h3>
                        <p className="price-help">
                          Type your desired price below. If you&apos;re not sure, you can skip this step and
                          continue.
                        </p>
                      </div>

                      <label htmlFor="requested-amount" className="sr-only">
                        Desired price
                      </label>
                      <input
                        id="requested-amount"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={requestedAmount}
                        onChange={(event) => setRequestedAmount(event.target.value)}
                        placeholder="£100"
                        className="price-input"
                      />

                      <div className="value-actions">
                        <button
                          type="button"
                          disabled={quoteLoading}
                          onClick={() => submitAmount("sell")}
                          className="value-continue disabled:cursor-not-allowed"
                        >
                          {quoteLoading ? "Working it out..." : "Continue"}
                        </button>
                        <button
                          type="button"
                          disabled={quoteLoading}
                          onClick={() => submitAmount("unsure")}
                          className="value-unsure disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          I&apos;m not sure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "congrats" && quote ? (
                <div className="journey-plain-card relative mx-auto flex w-full max-w-[420px] flex-col items-center overflow-hidden rounded-[36px] bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                  {!spinOpen ? <Celebration key="congrats" preset="congrats" /> : null}
                  <div className="journey-split flex w-full flex-col items-center">
                    <div className="device-visual">
                      <Image
                        src={getDeviceImageSrc(quote)}
                        alt={`${quote.brand} ${quote.model}`}
                        width={323}
                        height={483}
                        unoptimized
                      />
                    </div>
                    <div className="journey-split-content flex flex-col items-center">
                      <h2 className="mt-6 font-sans text-[26px] font-normal leading-[1.3] text-[#1D1D1F] lg:mt-0 lg:text-[48px] lg:leading-[60px]">
                        Congratulations!
                      </h2>
                      <p className="mt-2 max-w-[340px] text-[16px] leading-6 text-[#6E6E73] lg:max-w-none lg:text-[20px]">
                        Your {quote.brand} {quote.model} is sold for up to
                      </p>
                      <div className="guide-price guide-price-purple mt-2">{formatCurrency(quote.cashOfferGbp)}</div>
                      <p className="mt-3 max-w-[340px] text-[13px] leading-5 text-[#6E6E73] lg:max-w-[520px] lg:text-[16px] lg:leading-6">
                        Every seller gets a free spin! Play our prize wheel for a bonus voucher, cash top-up,
                        or mystery bag worth up to £600.
                      </p>
                      <div className="mt-6 flex w-full flex-col gap-3 lg:mt-8 lg:max-w-[320px]">
                        <Button type="button" onClick={startSpin} className="btn-purple w-full">
                          Spin the wheel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "checkout" && quote ? (
                <div className="journey-plain-card mx-auto w-full max-w-[420px] rounded-[36px] bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                  <div className="journey-split flex w-full flex-col items-center">
                    <div className="mx-auto device-visual">
                      <Image
                        src={getDeviceImageSrc(quote)}
                        alt={`${quote.brand} ${quote.model}`}
                        width={323}
                        height={483}
                        unoptimized
                      />
                      <span className="device-visual-badge">Sold</span>
                    </div>

                    <div className="journey-split-content w-full">
                      <div className="final-offer-card mt-6 lg:mt-0">
                        <p className="final-offer-label">Your final offer</p>
                        <div className="final-offer-amount">
                          {formatCurrency(quote.cashOfferGbp + (quote.reward?.isCash ? quote.reward.valueGbp : 0))}
                        </div>
                        {quote.reward && quote.reward.type !== "none" ? (
                          <p className="final-offer-note">
                            {formatCurrency(quote.cashOfferGbp)} offer + {quote.reward.label}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-1.5 text-left">
                        <div className="summary-row">
                          <span className="summary-row-label">Device</span>
                          <span className="summary-row-value">{quote.brand} {quote.model}</span>
                        </div>
                        {quote.storageOption ? (
                          <div className="summary-row">
                            <span className="summary-row-label">Storage</span>
                            <span className="summary-row-value">{quote.storageOption}</span>
                          </div>
                        ) : null}
                        <div className="summary-row">
                          <span className="summary-row-label">Condition</span>
                          <span className="summary-row-value">{conditionLabels[quote.condition]}</span>
                        </div>
                        <div className="summary-row">
                          <span className="summary-row-label">Sold for</span>
                          <span className="summary-row-value">up to {formatCurrency(quote.cashOfferGbp)}</span>
                        </div>
                        {quote.reward && quote.reward.type !== "none" ? (
                          <div className="summary-row">
                            <span className="summary-row-label">Bonus reward</span>
                            <span className="summary-row-value">{quote.reward.label}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 text-left">
                        <h3 className="text-base font-semibold text-[#1D1D1F]">
                          Do you have safe packaging (e.g. the original box) to send your device in?
                        </h3>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <Button type="button" onClick={() => choosePackaging(true)} className="w-full">
                            Yes, I have packaging
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => choosePackaging(false)} className="w-full">
                            No, send me a pack
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "postagePack" && quote ? (
                <div className="journey-plain-card mx-auto w-full max-w-[420px] rounded-[36px] bg-white p-6 text-left shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                  <div className="journey-split flex w-full flex-col items-center">
                    <div className="device-visual">
                      <Image
                        src={getDeviceImageSrc(quote)}
                        alt={`${quote.brand} ${quote.model}`}
                        width={323}
                        height={483}
                        unoptimized
                      />
                    </div>
                    <div className="journey-split-content w-full">
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1D1D1F] lg:text-3xl">
                      A protective pack costs {formatCurrency(POSTAGE_PACK_COST_GBP)}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      This is fully refunded &mdash; it gets added back to your payout once we receive and
                      inspect your device.
                    </p>

                    <div className="mt-5">
                      <label htmlFor="pack-address" className="field-label">
                        Where should we send it?
                      </label>
                      <textarea
                        id="pack-address"
                        value={collectionAddress}
                        onChange={(event) => setCollectionAddress(event.target.value)}
                        rows={3}
                        className="field-input py-3 focus-visible:ring-2 focus-visible:ring-brand"
                      />
                    </div>

                    {postagePackError ? (
                      <div className="mt-4 rounded-2xl bg-[rgba(254,242,242,1)] px-4 py-3 text-sm text-[rgba(153,27,27,1)]">
                        {postagePackError}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-col gap-3">
                      <Button type="button" disabled={postagePackLoading} onClick={startPostagePackCheckout} className="w-full">
                        {postagePackLoading ? "Redirecting to payment..." : `Pay ${formatCurrency(POSTAGE_PACK_COST_GBP)} & continue`}
                      </Button>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-muted">
                      Card payment is securely handled by Stripe. We never see or store your card details.
                    </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === "payout" && quote ? (
                <form
                  onSubmit={handleConfirmTrade}
                  className="payout-main mx-auto w-full max-w-[420px] rounded-[36px] bg-white p-6 text-left shadow-[0_24px_70px_rgba(0,0,0,0.08)] lg:max-w-[720px]"
                >
                  <div className="payout-columns space-y-4 lg:space-y-0">
                    <div className="payout-col-left space-y-4">
                      <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] lg:text-3xl">
                        A few details to pay you
                      </h2>

                      <div className="trust-box">
                        We need your contact and bank details so our team can confirm your device and send your
                        payment directly once it&apos;s received and inspected. Your details are handled in line
                        with our{" "}
                        <a href="https://mobilearcadeltd.co.uk/privacy" target="_blank" rel="noreferrer" className="font-semibold text-brand">
                          Privacy Policy
                        </a>{" "}
                        and are never shared with third parties.
                      </div>

                      <div>
                        <label htmlFor="customer-name" className="field-label">Full name</label>
                        <input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="customer-email" className="field-label">Email</label>
                          <input id="customer-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                        </div>
                        <div>
                          <label htmlFor="customer-mobile" className="field-label">Mobile</label>
                          <input id="customer-mobile" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="collection-address" className="field-label">
                          {hasOwnPackaging ? "Collection address" : "Return address"}
                        </label>
                        <textarea
                          id="collection-address"
                          value={collectionAddress}
                          onChange={(e) => setCollectionAddress(e.target.value)}
                          rows={2}
                          className="field-input py-3 focus-visible:ring-2 focus-visible:ring-brand"
                          required
                        />
                      </div>
                    </div>

                    <div className="payout-col-right space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        <div>
                          <label htmlFor="bank-name" className="field-label">Account name</label>
                          <input id="bank-name" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                        </div>
                        <div>
                          <label htmlFor="bank-sort" className="field-label">Sort code</label>
                          <input id="bank-sort" value={bankSortCode} onChange={(e) => setBankSortCode(e.target.value)} placeholder="12-34-56" className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                        </div>
                        <div>
                          <label htmlFor="bank-number" className="field-label">Account number</label>
                          <input id="bank-number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="field-input focus-visible:ring-2 focus-visible:ring-brand" required />
                        </div>
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
                          <a href="https://mobilearcadeltd.co.uk/terms" target="_blank" rel="noreferrer" className="font-semibold text-brand">
                            Terms &amp; Conditions
                          </a>{" "}
                          and have reviewed the{" "}
                          <a href="https://mobilearcadeltd.co.uk/privacy" target="_blank" rel="noreferrer" className="font-semibold text-brand">
                            Privacy Policy
                          </a>
                          .
                        </span>
                      </label>

                      {confirmError ? (
                        <div className="rounded-2xl bg-[rgba(254,242,242,1)] px-4 py-3 text-sm text-[rgba(153,27,27,1)]">
                          {confirmError}
                        </div>
                      ) : null}

                      <Button type="submit" disabled={confirmLoading || !termsAccepted} className="w-full">
                        {confirmLoading ? "Confirming..." : "Confirm"}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : null}

              {step === "done" && trade && quote ? (
                <div className="journey-plain-card done-main mx-auto w-full max-w-[420px] rounded-[36px] bg-brand p-7 text-center text-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                  <div className="journey-split flex w-full flex-col items-center">
                    <div className="device-visual done-device">
                      <Image
                        src={getDeviceImageSrc(quote)}
                        alt={`${quote.brand} ${quote.model}`}
                        width={323}
                        height={483}
                        unoptimized
                      />
                    </div>
                    <div className="journey-split-content w-full">
                      <h2 className="done-title text-2xl font-semibold tracking-tight">
                        That&apos;s it! Your {quote.brand} {quote.model} is now sold.
                      </h2>
                      <p className="done-copy mt-4 text-sm leading-6 text-white/90">
                        Nice one &mdash; you just supported a local British business, saved time, helped the
                        planet, and got real money for a device that would otherwise sit in a drawer.
                      </p>
                      <p className="done-copy mt-4 text-sm leading-6 text-white/90">
                        Our team will get in touch to confirm your device and settle funds directly to the bank
                        details you provided. Reference:{" "}
                        <span className="font-semibold">{trade.tradeReferenceId}</span>
                      </p>
                      <div className="done-notice mt-6 rounded-2xl bg-white/10 p-4 text-left text-xs leading-5 text-white">
                        We will never call you to ask for your bank card details, ask you to move funds into
                        another account, or ask for any payment before we pay you.
                      </div>

                      <div
                        className="mt-6 rounded-2xl p-5 text-left"
                        style={{ background: "var(--ma-purple)" }}
                      >
                        <p className="text-sm font-semibold text-white lg:text-base">
                          Got another old phone gathering dust?
                        </p>
                        <p className="mt-2 text-xs leading-5 text-white/85 lg:text-sm">
                          Sell it alongside this one &mdash; even if it&apos;s the one buried in your mum&apos;s
                          attic &mdash; and unlock bulk pricing on your next trade-in.
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => startFunnelForCategory(deviceCategory)}
                          className="mt-4 w-full lg:max-w-[320px]"
                          style={{ color: "var(--ma-purple)" }}
                        >
                          Start another quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Spin-the-wheel modal */}
      {spinOpen ? (
        <div className="spin-overlay">
          <div className="spin-modal">
            <div className="spin-modal-inner">
              {!rewardRevealed ? (
                <>
                  <div className="spin-copy">
                    <h2 className="spin-title">You&apos;ve earned a bonus spin!</h2>
                    <p className="spin-help">
                      Great news &mdash; your trade-in qualifies for an exclusive Mobile Arcade bonus. Spin
                      the wheel for a chance to win extra rewards!
                    </p>
                  </div>

                  <div className="spin-wheel-wrap">
                    <SpinWheelSvg rotation={spinRotation} />
                    <div className="spin-pointer" />
                  </div>

                  {spinError ? (
                    <div className="w-full rounded-2xl bg-[rgba(254,242,242,1)] px-4 py-3 text-sm text-[rgba(153,27,27,1)]">
                      {spinError}
                    </div>
                  ) : null}

                  <div className="spin-actions">
                    <button type="button" disabled={spinning || rewardLoading} onClick={playSpin} className="spin-button disabled:cursor-not-allowed">
                      {spinning ? "Spinning..." : "Spin to win"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="spin-reveal">
                  <Celebration key="reward" preset="reward" />
                  <h2 className="spin-title">You won!</h2>
                  <div className="spin-reward-card">
                    <p className="spin-reward-intro">Great spin! Your bonus reward is ready.</p>
                    <div className="spin-reward-value">{quote?.reward?.label}</div>
                    <p className="spin-reward-note">Added to your offer</p>
                  </div>
                  <p className="spin-help">
                    This reward is on top of your cash offer and will be emailed as a code once your
                    trade-in is confirmed.
                  </p>
                  <button type="button" onClick={continueAfterReward} className="spin-button">
                    See final offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section className="steps-section">
        <div className="steps-heading">
          <h2>Three easy steps</h2>
          <p>To turn your old device into cash</p>
        </div>

        <div className="steps-list">
          {cfg.steps.map((item, index) => (
            <ProcessStepCard key={item.title} index={index} title={item.title} body={item.body} imageUrl={item.imageUrl} />
          ))}
        </div>
      </section>

      <FAQAccordion
        faqs={cfg.faqs}
        openIndex={openFaqIndex}
        onToggle={(index) => setOpenFaqIndex((current) => (current === index ? -1 : index))}
      />

      <MobileArcadeFooter />
    </div>
  );
}
