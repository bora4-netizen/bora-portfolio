
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const CONTACT_EMAIL = "borazen18@gmail.com";

// Free form backends. Neither needs an account. sendm8 asks the owner to
// confirm once per email address and then works on every domain, so it is the
// default. FormSubmit asks for confirmation once per domain, so it is only a
// backup (e.g. a new deployment domain that hasn't been activated yet).
const SENDM8_ENDPOINT = `https://sendm8.com/f/${CONTACT_EMAIL}`;
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

/** True when all three EmailJS credentials are present in .env */
export const emailConfigured = Boolean(
  SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY
);

// Help the developer notice the EmailJS setup status while developing
if (!emailConfigured && import.meta.env.DEV) {
  console.info(
    "[contact] EmailJS is not configured — messages are delivered via " +
      "sendm8 (with FormSubmit as a backup) instead. To use EmailJS, add " +
      "VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and " +
      "VITE_EMAILJS_PUBLIC_KEY to .env (see .env.example), then restart " +
      "the dev server."
  );
}

/**
 * Send a contact message. Visitors never leave the page.
 * Delivery chain:
 *   1. EmailJS (when configured in .env)
 *   2. sendm8 (default — one-time confirmation, works on all domains)
 *   3. FormSubmit AJAX (backup — one-time confirmation per domain)
 */
export async function sendContactMessage({ name, email, message }) {
  if (emailConfigured) {
    return emailjs.send(
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
  }

  try {
    return await sendViaSendm8({ name, email, message });
  } catch (sendm8Error) {
    console.warn("[contact] sendm8 failed, trying FormSubmit:", sendm8Error);
    return sendViaFormSubmit({ name, email, message });
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
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !(data.success === "true" || data.success === true)) {
    const reason =
      typeof data.message === "string"
        ? data.message
        : "Message could not be delivered.";
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
