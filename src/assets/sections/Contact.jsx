
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import SectionTitle from "../components/SectionTitle";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openMailto = () => {
    const subject = encodeURIComponent(
      `Portfolio contact from ${form.name}`
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href =
      `mailto:chorkbora4@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fallback: if EmailJS keys aren't set up yet, use the email app
    if (!isConfigured) {
      openMailto();
      return;
    }

    setStatus("sending");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          reply_to: form.email,
          message: form.message,
        },
        { publicKey: PUBLIC_KEY }
      );

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("EmailJS error:", error);
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
                  <p>chorkbora4@gmail.com</p>
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
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#111827] border border-white/10 p-7 rounded-2xl space-y-5"
          >

            <div>
              <label className="block mb-2 text-sm">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                Your Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Write your message..."
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none"
              />
            </div>

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

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-lg flex justify-center items-center gap-2 transition"
            >
              {status === "sending"
                ? <>Sending...</>
                : <>Send Message <Send size={18} /></>
              }
            </button>

          </motion.form>

        </div>
      </div>
    </section>
  );
}
