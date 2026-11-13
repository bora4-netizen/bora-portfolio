
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

const inputClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500";

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

  // Hide the "sent" confirmation a few seconds after it appears
  useEffect(() => {
    if (status !== "success") return;
    const timeout = setTimeout(() => setStatus("idle"), 4000);
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
      className="relative overflow-hidden py-16 px-4 sm:py-28 sm:px-6"
    >
      <Parallax
        className="absolute -bottom-24 -right-16 pointer-events-none"
        from={60}
        to={-60}
      >
        <div className="w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </Parallax>

      <div className="relative max-w-7xl mx-auto">

        <SectionTitle
          title="Get In Touch"
          subtitle="Contact me"
        />

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-3xl font-bold mb-5">
              Let's Build Something
              <span className="text-blue-500"> Together.</span>
            </h3>

            <p className="text-gray-400 leading-relaxed mb-8 sm:mb-10">
              I'm open to learning opportunities, internships,
              collaborations, and junior developer positions.
              Feel free to send me a message.
            </p>

            <div className="space-y-6">

              <div className="flex items-center gap-3 sm:gap-4">
                <Mail className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-blue-400 transition"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <MapPin className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>Cambodia</p>
                </div>
              </div>

            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            noValidate={false}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#111827] border border-white/10 p-4 sm:p-7 rounded-2xl space-y-5"
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

            <div aria-live="polite">
              {status === "success" && (
                <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                  ✓ Message sent! I'll get back to you soon.
                </p>
              )}

              {status === "pending" && (
                <p className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
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
                </p>
              )}

              {status === "error" && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
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
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-lg flex justify-center items-center gap-2 transition"
            >
              {status === "sending"
                ? <>Sending <Spinner /></>
                : <>Send Message <Send size={18} /></>
              }
            </button>

          </motion.form>

        </div>
      </div>
    </section>
  );
}
