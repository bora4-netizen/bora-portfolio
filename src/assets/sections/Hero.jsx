
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  ArrowRight,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-28 px-6"
    >
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-14 items-center">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-blue-400 font-medium mb-5">
            Hello, I'm Bora 👋
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Building the
            <span className="text-blue-500"> Web</span>
            <br />
            One Line at a Time.
          </h1>

          <h2 className="text-2xl text-gray-300 mt-6">
            Junior Web Developer
          </h2>

          <p className="text-gray-400 mt-5 leading-relaxed max-w-xl">
            I'm a Web Development student passionate about
            creating modern, responsive, and user-friendly
            web applications. I enjoy learning new technologies
            and turning ideas into real projects.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="#projects"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              View My Work <ArrowRight size={18} />
            </a>

            <a
              href="/resume.pdf"
              download
              className="border border-white/20 hover:border-blue-500 px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              Download CV <Download size={18} />
            </a>
          </div>

          <div className="flex gap-6 mt-10 text-gray-400">
            <a href="https://github.com/YOUR_USERNAME">
              <Github className="hover:text-blue-400" />
            </a>
            <a href="https://linkedin.com/in/YOUR_USERNAME">
              <Linkedin className="hover:text-blue-400" />
            </a>
            <a href="mailto:YOUR_EMAIL@example.com">
              <Mail className="hover:text-blue-400" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20" />

            <img
              src="/images/profile.jpg"
              alt="Bora's profile"
              className="relative w-64 h-64 md:w-96 md:h-96 object-cover rounded-full border-4 border-blue-500/40 shadow-2xl"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
