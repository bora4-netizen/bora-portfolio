
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Download,
  ArrowRight,
} from "lucide-react";
import { Github, Linkedin } from "../components/BrandIcons";

const roles = [
  "Junior Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Lifelong Learner",
];

function useTypewriter(words, typeSpeed = 85, deleteSpeed = 40, pause = 1600) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex % words.length];

    const delay =
      !deleting && text === word
        ? pause
        : deleting
          ? deleteSpeed
          : typeSpeed;

    const timeout = setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause]);

  return text;
}

function FloatChip({ label, dot, className, delay = 0, duration = 4 }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute z-10 flex items-center gap-1.5 sm:gap-2 bg-[#111827]/80 backdrop-blur border border-white/10 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm text-gray-200 shadow-lg shadow-black/30 ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </motion.div>
  );
}

export default function Hero() {
  const typed = useTypewriter(roles);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 px-6 overflow-hidden"
    >

      {/* Aurora background */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-blue-600/25 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-40 w-[30rem] h-[30rem] bg-violet-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 left-1/3 w-[26rem] h-[26rem] bg-cyan-500/15 rounded-full blur-3xl"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-14 items-center">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm text-gray-300 mb-6"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Open to internships &amp; junior roles
          </motion.div>

          <p className="text-blue-400 font-medium mb-4 text-lg">
            Hi, I'm Bora 👋
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Building the
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500">
              {" "}Web
            </span>
            <br />
            One Line at a Time.
          </h1>

          <h2 className="text-2xl text-gray-300 mt-6 h-9">
            {typed}
            <span className="text-blue-400 animate-pulse ml-0.5">|</span>
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
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-600/25 px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              View My Work <ArrowRight size={18} />
            </a>

            <a
              href="/resume.pdf"
              download="Bora-CV.pdf"
              className="bg-white/5 backdrop-blur border border-white/10 hover:border-blue-500/60 px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              Download CV <Download size={18} />
            </a>
          </div>

          <div className="flex gap-4 mt-10">
            <a
              href="https://github.com/bora4-netizen"
              aria-label="GitHub"
              className="p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 hover:-translate-y-1 transition"
            >
              <Github size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/bora-chork-1bb1843a7/"
              aria-label="LinkedIn"
              className="p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 hover:-translate-y-1 transition"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="mailto:chorkbora4@gmail.com"
              aria-label="Email"
              className="p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 hover:-translate-y-1 transition"
            >
              <Mail size={22} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-violet-600/40 blur-[80px]" />

            <div className="relative bg-gradient-to-tr from-blue-500 to-violet-500 p-[3px] rounded-[2.5rem] shadow-2xl shadow-blue-600/20">
              <img
                src="/images/bora.png"
                alt="Bora's profile"
                className="w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 object-cover rounded-[2.5rem] block"
              />
            </div>

            <FloatChip
              label="React"
              dot="bg-cyan-400"
              className="-left-3 top-8 sm:-left-6 sm:top-10"
              delay={0}
            />
            <FloatChip
              label="Laravel"
              dot="bg-red-400"
              className="-right-4 top-1/3 sm:-right-8"
              delay={0.6}
              duration={4.5}
            />
            <FloatChip
              label="Spring Boot"
              dot="bg-emerald-400"
              className="right-1 -bottom-4 sm:right-2 sm:-bottom-5"
              delay={1.2}
              duration={5}
            />
          </div>
        </motion.div>

      </div>

    </section>
  );
}
