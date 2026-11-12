
import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Portfolio contact from ${form.name}`
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href =
      `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">

        <SectionTitle
          title="Get In Touch"
          subtitle="Contact me"
        />

        <div className="grid md:grid-cols-2 gap-12">

          <div>
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
                  <p>YOUR_EMAIL@example.com</p>
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
          </div>

          <form
            onSubmit={handleSubmit}
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

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg flex justify-center items-center gap-2 transition"
            >
              Send Message <Send size={18} />
            </button>

          </form>

        </div>
      </div>
    </section>
  );
}
