
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
  "w-full px-4 py-3 rounded-lg border border-white/10 bg-[#0B1120]/50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm text-white placeholder-gray-500";

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
      className="relative overflow-hidden py-16 px-4 sm:py-28 sm:px-6"
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <SectionTitle
            title="Get In Touch"
            subtitle="Contact me"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-3xl font-bold mb-5 tracking-tight">
              Let's Build Something
              <span className="text-blue-500"> Together.</span>
            </h3>

            <p className="text-gray-400 leading-relaxed mb-8 sm:mb-10 text-sm sm:text-base">
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-blue-400 hover:text-blue-300 transition text-sm"
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-sm text-gray-300">Cambodia</p>
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
            className="relative p-1 rounded-2xl border border-transparent bg-[#111827]/50 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            <div className="inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/30 to-violet-500/30 mask-[linear-gradient(0,0)_0_0_padding-box_0_0_-webkit-mask] -webkit-mask-composite destination-out" />
            <div className="relative p-4 sm:p-7 space-y-5">

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
                whileHover={{ borderColor: "blue-500/30" }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <label htmlFor="contact-name" className="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity peer-focus:opacity-100">
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
                    placeholder=" "
                    className={inputClass + " peer"}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ borderColor: "blue-500/30" }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <label htmlFor="contact-email" className="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity peer-focus:opacity-100">
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
                    placeholder=" "
                    className={inputClass + " peer"}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ borderColor: "blue-500/30" }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <label htmlFor="contact-message" className="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity peer-focus:opacity-100">
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
                    placeholder=" "
                    className={`${inputClass} resize-none peer`}
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                {status === "sending"
                  ? <>Sending <Spinner /></>
                  : <>Send Message <Send size={18} /></>}
              </motion.button>

            </div>
          </motion.form>

        </div>
      </div>
    </section>
  );
}
