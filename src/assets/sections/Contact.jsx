
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import FuturisticButton from "../components/FuturisticButton";
import { sendContactMessage } from "../lib/sendMessage";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#050816]/60 px-4 py-3 outline-none backdrop-blur transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/15";

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
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorDetail, setErrorDetail] = useState("");

  // Hide the "sent" confirmation a few seconds after it appears
  useEffect(() => {
    if (status !== "success") return;
    const timeout = setTimeout(() => setStatus("idle"), 4000);
    return () => clearTimeout(timeout);
  }, [status]);

  const handleChange = (e) => {
    // New input clears any previous success/error feedback
    if (status === "success" || status === "error") {
      setStatus("idle");
      setErrorDetail("");
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
    setErrorDetail("");

    try {
      await sendContactMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      // EmailJS errors carry the reason in .text, everything else in .message
      const detail = error?.message || error?.text || "";
      console.error("Contact form failed to send:", detail || error);
      setStatus("error");
      setErrorDetail(detail);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 sm:py-28">
      <div className="max-w-7xl mx-auto">

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
              <span className="text-cyan-400"> Together.</span>
            </h3>

            <p className="text-gray-400 leading-relaxed mb-8">
              I'm open to learning opportunities, internships,
              collaborations, and junior developer positions.
              Feel free to send me a message.
            </p>

            <div className="space-y-6">

              <div className="flex items-center gap-4">
                <Mail className="text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href="mailto:chorkbora4@gmail.com"
                    className="hover:text-cyan-400 transition"
                  >
                    chorkbora4@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="text-cyan-400" />
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
            className="relative bg-[#0a0a24]/50 border border-white/10 p-7 rounded-2xl space-y-5 shadow-[0_24px_80px_-40px_rgba(34,211,238,0.35)] backdrop-blur-xl"
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

              {status === "error" && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 space-y-1">
                  <p>
                    Something went wrong. Please email me directly at{" "}
                    <a
                      href="mailto:chorkbora4@gmail.com"
                      className="underline hover:text-red-300 transition"
                    >
                      chorkbora4@gmail.com
                    </a>
                    .
                  </p>
                  {errorDetail && (
                    <p className="text-xs text-red-400/70 break-words">
                      {errorDetail}
                    </p>
                  )}
                </div>
              )}
            </div>

            <FuturisticButton
              type="submit"
              variant="primary"
              size="lg"
              icon={status === "sending" ? undefined : Send}
              iconRight
              disabled={status === "sending"}
              className="w-full"
            >
              {status === "sending" ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </FuturisticButton>

          </motion.form>

        </div>
      </div>
    </section>
  );
}
