
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { sendContactMessage } from "../lib/sendMessage";

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
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

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
      await sendContactMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form failed to send:", error);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">

        <SectionTitle
          title="Get In Touch"
          subtitle="Contact me"
        />

        <div className="grid md:grid-cols-2 gap-12">

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

            <p className="text-gray-400 leading-relaxed mb-8">
              I'm open to learning opportunities, internships,
              collaborations, and junior developer positions.
              Feel free to send me a message.
            </p>

            <div className="space-y-6">

              <div className="flex items-center gap-4">
                <Mail className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href="mailto:chorkbora4@gmail.com"
                    className="hover:text-blue-400 transition"
                  >
                    chorkbora4@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
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
            className="bg-[#111827] border border-white/10 p-7 rounded-2xl space-y-5"
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
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  Something went wrong. Please email me directly at
                  chorkbora4@gmail.com.
                </p>
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
