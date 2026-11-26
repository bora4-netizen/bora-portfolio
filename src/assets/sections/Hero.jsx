
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Mail,
  Download,
  ArrowRight,
} from "lucide-react";
import { Github, Linkedin } from "../components/BrandIcons";
import FuturisticButton from "../components/FuturisticButton";
import { CONTACT_EMAIL } from "../lib/sendMessage";

const roles = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Junior Web Developer",
  "Lifelong Learner",
];

// Modern spring config for natural-feeling motion
const spring = { type: "spring", stiffness: 260, damping: 22 };

// Staggered reveal variants for content groups
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring,
  },
};

function useTypewriter(words, typeSpeed = 70, deleteSpeed = 35, pause = 1700) {
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

function FloatChip({ label, dot, className, delay = 0, duration = 5 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -12, 0],
        scale: 1,
      }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute z-10 flex items-center gap-1.5 bg-[#111827]/85 backdrop-blur-md border border-white/10 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-full text-[0.7rem] xs:text-xs sm:text-sm text-gray-200 shadow-lg shadow-black/30 ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </motion.div>
  );
}

export default function Hero() {
  const typed = useTypewriter(roles);
  const reduceMotion = useReducedMotion();

  // Subtle parallax for the portrait — restrained movement for a modern feel
  const { scrollY } = useScroll();
  const yPhoto = useTransform(scrollY, [0, 1200], [0, -40]);
  const parallax = (value) => (reduceMotion ? undefined : { y: value });

  return (
    <section
      id="home"
      className="relative flex min-h-svh items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28"
    >

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8 }}
        >

          <motion.div
            variants={itemVariants}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-gray-300 backdrop-blur sm:mb-6 sm:gap-2.5 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Open to internships &amp; junior roles
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-3 text-base font-medium text-cyan-400 sm:mb-4 sm:text-lg"
          >
            Hi, I'm Bora 👋
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Building the
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">
              {" "}Web
            </span>
            <br />
            One Line at a Time.
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="mt-4 flex min-h-8 items-center text-lg text-gray-300 sm:mt-6 sm:min-h-9 sm:text-2xl"
          >
            {typed}
            <span className="text-cyan-400 animate-pulse ml-0.5">|</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:mt-5 sm:text-base"
          >
            I'm a Web Development student passionate about
            creating modern, responsive, and user-friendly
            web applications. I enjoy learning new technologies
            and turning ideas into real projects.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <FuturisticButton
              href="#projects"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconRight
              className="w-full sm:w-auto"
            >
              View My Projects
            </FuturisticButton>

            <FuturisticButton
              href="/resume.pdf"
              download="Bora-CV.pdf"
              variant="outline"
              size="lg"
              icon={Download}
              className="w-full sm:w-auto"
            >
              Download CV
            </FuturisticButton>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-7 flex justify-start gap-3 sm:mt-9 sm:gap-4"
          >
            <motion.a
              href="https://github.com/bora4-netizen"
              aria-label="GitHub"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur transition hover:border-cyan-400/60 hover:text-cyan-400 sm:h-11 sm:w-11"
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/bora-chork-1bb1843a7/"
              aria-label="LinkedIn"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur transition hover:border-cyan-400/60 hover:text-cyan-400 sm:h-11 sm:w-11"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Email"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur transition hover:border-cyan-400/60 hover:text-cyan-400 sm:h-11 sm:w-11"
            >
              <Mail size={20} />
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ...spring }}
          style={parallax(yPhoto)}
          className="flex justify-center md:justify-end"
        >
          <div className="float-slow relative">

            {/* Soft glow */}
            <div className="portrait-aura absolute inset-0 bg-gradient-to-tr from-blue-500/45 via-indigo-500/40 to-cyan-400/45 blur-[80px]" />

            {/* Frosted glass card */}
            <div className="relative rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl shadow-blue-900/40 backdrop-blur-xl sm:rounded-[2.5rem]">
              {/* Top hairline highlight */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              <div className="relative overflow-hidden rounded-[1.6rem] sm:rounded-[2rem]">
                <img
                  src="/images/bora.png"
                  alt="Bora's profile"
                  className="block h-56 w-56 object-cover xs:h-60 xs:w-60 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96"
                />

                {/* Glass sheen */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 28%, transparent 46%, transparent 70%, rgba(96,165,250,0.12) 100%)",
                  }}
                />
                {/* Subtle color grade */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(34,211,238,0.14) 55%, rgba(99,102,241,0.20))",
                    mixBlendMode: "soft-light",
                  }}
                />
              </div>
            </div>

            <FloatChip
              label="React"
              dot="bg-cyan-400"
              className="-left-1 top-5 xs:-left-3 xs:top-7 sm:-left-6 sm:top-10"
              delay={0}
            />
            <FloatChip
              label="Laravel"
              dot="bg-red-400"
              className="-right-1 top-1/3 xs:-right-4 sm:-right-8"
              delay={0.7}
              duration={5.5}
            />
            <FloatChip
              label="Spring Boot"
              dot="bg-emerald-400"
              className="-bottom-3 right-1 xs:-bottom-4 sm:right-2 sm:-bottom-5"
              delay={1.4}
              duration={6}
            />
          </div>
        </motion.div>

      </div>

    </section>
  );
}
