
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Mail,
  Download,
  ArrowRight,
} from "lucide-react";
import { Github, Linkedin } from "../components/BrandIcons";
import { CONTACT_EMAIL } from "../lib/sendMessage";

const roles = [
  "Junior Web Developer",
  "Frontend Developer",
  "Backend Developer",
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

  // Subtle parallax layers — restrained movement for a modern feel
  const { scrollY } = useScroll();
  const yBlob1 = useTransform(scrollY, [0, 1200], [0, 80]);
  const yBlob2 = useTransform(scrollY, [0, 1200], [0, -60]);
  const yBlob3 = useTransform(scrollY, [0, 1200], [0, 70]);
  const yGrid = useTransform(scrollY, [0, 1200], [0, 40]);
  const yPhoto = useTransform(scrollY, [0, 1200], [0, -40]);
  const parallax = (value) => (reduceMotion ? undefined : { y: value });

  return (
    <section
      id="home"
      className="relative flex min-h-svh items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28"
    >

      {/* Aurora background — parallax layers */}
      <motion.div
        style={parallax(yBlob1)}
        className="absolute -top-32 -left-32"
      >
        <motion.div
          animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 22, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="h-[22rem] w-[22rem] rounded-full bg-blue-600/25 blur-3xl sm:h-[35rem] sm:w-[35rem] md:h-[40rem] md:w-[40rem]"
        />
      </motion.div>

      <motion.div
        style={parallax(yBlob2)}
        className="absolute top-1/4 -right-[12rem] sm:top-[20%] sm:-right-[18rem] md:-right-40"
      >
        <motion.div
          animate={reduceMotion ? undefined : { x: [0, -28, 0], y: [0, 32, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="h-[24rem] w-[24rem] rounded-full bg-violet-600/20 blur-3xl sm:h-[30rem] sm:w-[30rem]"
        />
      </motion.div>

      <motion.div
        style={parallax(yBlob3)}
        className="absolute -bottom-40 sm:-bottom-32 left-1/3 sm:left-1/4"
      >
        <motion.div
          animate={reduceMotion ? undefined : { x: [0, 24, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="h-[20rem] w-[20rem] rounded-full bg-cyan-500/15 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
      </motion.div>

      {/* Grid overlay — drifts slower than the content */}
      <motion.div
        style={parallax(yGrid)}
        className="absolute inset-0 opacity-[0.35] aria-hidden-true"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-14">

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
            className="mb-3 text-base font-medium text-blue-400 sm:mb-4 sm:text-lg"
          >
            Hi, I'm Bora 👋
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Building the
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500">
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
            <span className="text-blue-400 animate-pulse ml-0.5">|</span>
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
            className="mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
          >
            <motion.a
              href="#projects"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-medium shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-violet-500 sm:w-auto"
            >
              View My Work <ArrowRight size={18} />
            </motion.a>

            <motion.a
              href="/resume.pdf"
              download="Bora-CV.pdf"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium backdrop-blur transition hover:border-blue-500/60 sm:w-auto"
            >
              Download CV <Download size={18} />
            </motion.a>
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
              className="p-2 sm:p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 transition"
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/bora-chork-1bb1843a7/"
              aria-label="LinkedIn"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="p-2 sm:p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 transition"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Email"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="p-2 sm:p-2.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/60 transition"
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
          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-violet-600/40 blur-[80px]" />

            <div className="relative rounded-[2rem] bg-gradient-to-tr from-blue-500 to-violet-500 p-[3px] shadow-2xl shadow-blue-600/20 sm:rounded-[2.5rem]">
              <img
                src="/images/bora.png"
                alt="Bora's profile"
                className="block h-56 w-56 rounded-[2rem] object-cover xs:h-60 xs:w-60 sm:h-72 sm:w-72 sm:rounded-[2.5rem] md:h-80 md:w-80 lg:h-96 lg:w-96"
              />
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
