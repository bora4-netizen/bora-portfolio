# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# bora-portfolio

## Contact form delivery

The contact form (`src/assets/lib/sendMessage.js`) tries these senders in order:

1. **EmailJS** — used when all three credentials are set in `.env`.
2. **FormSubmit** (`formsubmit.co/ajax/<email>`) — primary fallback.
3. **sendm8** (`sendm8.com/f/<email>`) — backup fallback.

Both free fallbacks require a **one-time activation email** to the address in
`CONTACT_EMAIL`:

- FormSubmit emails an **"Activate Form"** link after the first submission.
- sendm8 emails a **confirmation** link; before it is clicked, messages are
  stored but not delivered.

Until one of them is activated, the form shows the amber "message was saved,
but email delivery is still being set up" notice instead of the green
"Message sent" one. If you change `CONTACT_EMAIL`, activate the new address
again.

To use EmailJS instead, copy `.env.example` to `.env`, fill in the values from
https://dashboard.emailjs.com, and restart the dev server. Because `.env` is
gitignored, **the same variables must also be added in your hosting provider's
dashboard** (e.g. Vercel → Settings → Environment Variables) and the site
redeployed — Vite inlines them at build time.
