
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Direct delivery service — no account needed, just the target inbox.
// Requires a one-time activation: the first submission emails the owner,
// who clicks the activation link in that email. After that it works silently.
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/borazen18@gmail.com";

/** True when all three EmailJS credentials are present in .env */
export const emailConfigured = Boolean(
  SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY
);

// Help the developer notice the EmailJS setup status while developing
if (!emailConfigured && import.meta.env.DEV) {
  console.info(
    "[contact] EmailJS is not configured — messages are delivered via " +
      "FormSubmit instead. To use EmailJS, add VITE_EMAILJS_SERVICE_ID, " +
      "VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY to .env " +
      "(see .env.example), then restart the dev server."
  );
}

/**
 * Send a contact message. Visitors never leave the page.
 * Delivery chain:
 *   1. EmailJS (when configured in .env)
 * 2. FormSubmit AJAX (default — direct to borazen18@gmail.com)
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

  return sendViaFormSubmit({ name, email, message });
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
      typeof data.message === "string" ? `: ${data.message}` : "";
    throw new Error(`Message could not be delivered${reason}`);
  }

  return data;
}
