export type RequestState = {
  success: boolean;
  message: string;
  errors: Record<string, string>;
};

export type SellRequestPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  deviceModel?: string;
  condition?: string;
  storage?: string;
  preferredContact?: string;
  expectedPrice?: string;
  notes?: string;
};

export const initialRequestState: RequestState = {
  success: false,
  message: "",
  errors: {},
};

const requiredField = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildPlainText(fields: Record<string, string>) {
  return [
    "New Mobile Arcade device request",
    "",
    `Name: ${fields.fullName}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Device: ${fields.deviceModel}`,
    `Condition: ${fields.condition}`,
    `Storage: ${fields.storage}`,
    `Preferred contact: ${fields.preferredContact}`,
    `Expected price: ${fields.expectedPrice || "Not provided"}`,
    `Notes: ${fields.notes || "Not provided"}`,
    `Submitted at: ${new Date().toISOString()}`,
  ].join("\n");
}

function buildHtml(fields: Record<string, string>) {
  const rows = [
    ["Name", fields.fullName],
    ["Email", fields.email],
    ["Phone", fields.phone],
    ["Device", fields.deviceModel],
    ["Condition", fields.condition],
    ["Storage", fields.storage],
    ["Preferred contact", fields.preferredContact],
    ["Expected price", fields.expectedPrice || "Not provided"],
    ["Notes", fields.notes || "Not provided"],
    ["Submitted at", new Date().toISOString()],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;border:1px solid #d4d4d8;">${label}</td><td style="padding:8px 12px;border:1px solid #d4d4d8;">${value}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:Arial,sans-serif;color:#18181b;"><h2>New Mobile Arcade device request</h2><table style="border-collapse:collapse;">${tableRows}</table></div>`;
}

async function sendToWebhook(fields: Record<string, string>) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "mobile-arcade-landing-page",
      submittedAt: new Date().toISOString(),
      ...fields,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Webhook delivery failed.");
  }

  return true;
}

async function sendViaResend(fields: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM ?? "Mobile Arcade <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New sell request from ${fields.fullName}`,
      text: buildPlainText(fields),
      html: buildHtml(fields),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Email delivery failed.");
  }

  return true;
}

export async function processSellRequest(
  payload: SellRequestPayload,
): Promise<RequestState> {
  const fields = {
    fullName: requiredField(payload.fullName),
    email: requiredField(payload.email),
    phone: requiredField(payload.phone),
    deviceModel: requiredField(payload.deviceModel),
    condition: requiredField(payload.condition),
    storage: requiredField(payload.storage),
    preferredContact: requiredField(payload.preferredContact),
    expectedPrice: requiredField(payload.expectedPrice),
    notes: requiredField(payload.notes),
  };

  const errors: Record<string, string> = {};

  if (!fields.fullName) {
    errors.fullName = "Please enter your name.";
  }

  if (!fields.email) {
    errors.email = "Please enter your email.";
  } else if (!isValidEmail(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.phone) {
    errors.phone = "Please enter your phone number.";
  }

  if (!fields.deviceModel) {
    errors.deviceModel = "Please tell us what device you want to sell.";
  }

  if (!fields.condition) {
    errors.condition = "Please choose your device condition.";
  }

  if (!fields.storage) {
    errors.storage = "Please choose the storage size.";
  }

  if (!fields.preferredContact) {
    errors.preferredContact = "Please choose how you want us to contact you.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the highlighted fields and try again.",
      errors,
    };
  }

  try {
    const delivered =
      (await sendToWebhook(fields)) || (await sendViaResend(fields));

    if (!delivered) {
      console.log(buildPlainText(fields));

      return {
        success: true,
        message:
          "Request submitted. Delivery is currently using server logs only; add LEAD_WEBHOOK_URL or RESEND_API_KEY with LEAD_EMAIL_TO to route leads automatically.",
        errors: {},
      };
    }

    return {
      success: true,
      message: "Thanks. Your request is in, and Mobile Arcade can follow up with a quote shortly.",
      errors: {},
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "We could not submit your request right now. Please try again in a moment.",
      errors: {},
    };
  }
}
