
import emailjs from "@emailjs/browser";

const envValue = (value) => (value ?? "").trim();

const SERVICE_ID = envValue(import.meta.env.VITE_EMAILJS_SERVICE_ID);
const TEMPLATE_ID = envValue(import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
const PUBLIC_KEY = envValue(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export const CONTACT_EMAIL = "chorkkboraa@gmail.com";

// Free form backends, used when EmailJS is not configured (or fails).
// FormSubmit is the primary: after a one-time activation click it delivers
// immediately. sendm8 is the backup: it stores messages and only starts
// delivering once its one-time confirmation link has been clicked.
// Both services must be activated for CONTACT_EMAIL — see README.md.
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const SENDM8_ENDPOINT = `https://sendm8.com/f/${CONTACT_EMAIL}`;

/** True when all three EmailJS credentials are present in .env */
export const emailConfigured = Boolean(
  SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY
);

// Help the developer notice the EmailJS setup status while developing
if (!emailConfigured && import.meta.env.DEV) {
  console.info(
    "[contact] EmailJS is not configured — messages are delivered via " +
      "FormSubmit (with sendm8 as a backup) instead. To use EmailJS, add " +
      "VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and " +
      "VITE_EMAILJS_PUBLIC_KEY to .env (see .env.example), then restart " +
      "the dev server."
  );
}

/**
 * Send a contact message. Visitors never leave the page.
 * Delivery chain:
 *   1. EmailJS (when configured in .env)
 *   2. FormSubmit AJAX (fails over if EmailJS errors)
 *   3. sendm8 (backup — stores the message until its confirmation is clicked)
 */
export async function sendContactMessage({ name, email, message }) {
  if (emailConfigured) {
    try {
      return await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          reply_to: email,
          to_name: "Bora",
          message,
          sent_at: new Date().toLocaleString(),
        },
        { publicKey: PUBLIC_KEY }
      );
    } catch (emailJsError) {
      console.warn(
        "[contact] EmailJS failed, falling back to FormSubmit:",
        emailJsError
      );
    }
  }

  try {
    return await sendViaFormSubmit({ name, email, message });
  } catch (formSubmitError) {
    console.warn(
      "[contact] FormSubmit failed, trying sendm8:",
      formSubmitError
    );
    return sendViaSendm8({ name, email, message });
  }
}

async function sendViaSendm8({ name, email, message }) {
  const response = await fetch(SENDM8_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: `Portfolio message from ${name}`,
      _replyto: email,
      _gotcha: "",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    const reason =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Message could not be delivered.";
    throw new Error(reason);
  }

  if (data.pending === "confirmation" && import.meta.env.DEV) {
    console.info(
      "[contact] sendm8 stored the message and emailed a one-time " +
        "confirmation link. Click it once to start receiving messages."
    );
  }

  return data;
}

async function sendViaFormSubmit({ name, email, message }) {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: `Portfolio message from ${name}`,
      _replyto: email,
      _captcha: "false",
      _honey: "",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !(data.success === "true" || data.success === true)) {
    const reason =
      typeof data.message === "string"
        ? data.message
        : "Message could not be delivered.";

    if (reason.toLowerCase().includes("needs activation")) {
      throw new Error(
        `FormSubmit is not activated for ${CONTACT_EMAIL}. ` +
          "Click the 'Activate Form' link in the email FormSubmit sent, " +
          "then try again."
      );
    }

    throw new Error(reason);
  }

  return data;
}

/** Prefilled `mailto:` link used as the always-available fallback. */
export function buildMailtoLink({ name, email, message }) {
  const subject = `Portfolio message from ${name || "a visitor"}`;
  const body = [
    message,
    "",
    "—",
    name && `Name: ${name}`,
    email && `Email: ${email}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
