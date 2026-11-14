
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Parallax from "../components/Parallax";
import {
  CONTACT_EMAIL,
  buildMailtoLink,
  sendContactMessage,
} from "../lib/sendMessage";

const spring = { type: "spring", stiffness: 300, damping: 24 };

const inputClass =
  "w-full min-h-12 bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-base outline-none transition focus:border-blue-500";

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  // idle | sending | success | pending | error
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-dismiss transient feedback. Errors stay visible until the visitor
  // edits the form, so they always have time to read them.
  useEffect(() => {
    const delays = { success: 4000, pending: 12000 };
    const delay = delays[status];
    if (!delay) return;
    const timeout = setTimeout(() => setStatus("idle"), delay);
    return () => clearTimeout(timeout);
  }, [status]);

  const handleChange = (e) => {
    // New input clears any previous success/pending/error feedback
    if (status === "success" || status === "pending" || status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot filled → almost certainly a bot: pretend success, send nothing
    if (honeypot) {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      return;
    }

    setStatus("sending");

    try {
      const result = await sendContactMessage(form);

      // sendm8 stores messages but withholds delivery until the owner clicks
      // its one-time confirmation link. Don't claim "sent" in that case.
      if (result?.pending === "confirmation") {
        setStatus("pending");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form failed to send:", error);
      setErrorMessage(
        import.meta.env.DEV && error?.message ? error.message : ""
      );
      setStatus("error");
    }
  };

  const mailtoLink = buildMailtoLink(form);

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <Parallax
        className="absolute -bottom-24 -right-16 pointer-events-none"
        from={30}
        to={-30}
      >
        <div className="w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </Parallax>

      <div className="relative max-w-7xl mx-auto z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <SectionTitle
            title="Get In Touch"
            subtitle="Contact me"
          />
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 sm:gap-12">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="mb-4 text-2xl font-bold tracking-tight sm:mb-5 sm:text-3xl">
              Let's Build Something
              <span className="text-blue-500"> Together.</span>
            </h3>

            <p className="mb-8 text-sm leading-relaxed text-gray-400 sm:mb-10 sm:text-base">
              I'm open to learning opportunities, internships,
              collaborations, and junior developer positions.
              Feel free to send me a message.
            </p>

            <div className="space-y-6">

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <Mail className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="break-all transition hover:text-blue-400"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <MapPin className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>Cambodia</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            noValidate={false}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-5 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-7"
          >

            {/* Honeypot — hidden from humans, catches spam bots */}
            <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                name="company"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <motion.div
              whileHover={{ borderColor: "blue-500/40" }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label htmlFor="contact-name" className="block mb-2 text-sm">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="e.g. Your Name"
                  className={inputClass}
                />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: "blue-500/40" }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label htmlFor="contact-email" className="block mb-2 text-sm">
                  Your Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: "blue-500/40" }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label htmlFor="contact-message" className="block mb-2 text-sm">
                  Your Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={1200}
                  placeholder="Write your message..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </motion.div>

            <div aria-live="polite">
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3"
                >
                  ✓ Message sent! I'll get back to you soon.
                </motion.p>
              )}

              {status === "pending" && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3"
                >
                  Your message was saved, but email delivery is still being
                  set up, so it may be delayed. For anything urgent, email me
                  directly at{" "}
                  <a
                    href={mailtoLink}
                    className="underline underline-offset-2 hover:text-amber-200"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </motion.p>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"
                >
                  <p>
                    Sorry, your message could not be sent right now. You can
                    email me directly at{" "}
                    <a
                      href={mailtoLink}
                      className="underline underline-offset-2 hover:text-red-300"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                  {errorMessage && (
                    <p className="mt-2 text-red-300/80 break-words">
                      {errorMessage}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              disabled={status === "sending"}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending"
                ? <>Sending <Spinner /></>
                : <>Send Message <Send size={18} /></>}
            </motion.button>

          </motion.form>

        </div>
      </div>
    </section>
  );
}
