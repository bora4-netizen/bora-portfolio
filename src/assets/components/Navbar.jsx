
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("home");

  // Thin progress bar that tracks reading position
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.2,
  });

  // Lock body scroll and allow Escape to close the mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Close the mobile menu when the viewport becomes desktop-sized
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) setIsOpen(false);
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Highlight the section currently in view
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the menu first, then scroll once the body lock is released
  const closeAndNavigate = (event, href) => {
    if (!isOpen) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    setIsOpen(false);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.history.replaceState(null, "", href);
    }, 60);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/10"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">

        <Link
          to="/"
          onClick={(event) => closeAndNavigate(event, "#home")}
          className="flex items-center gap-2"
        >
          <img
            src="/logos/logo.png"
            alt="Bora logo"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {links.map((link) => {
            const isActive = active === link.href.slice(1);

            return (
              <a
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3 py-2 rounded-lg text-sm lg:text-base transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-blue-400"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  />
                )}
              </a>
            );
          })}
        </div>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center justify-center min-h-10 bg-blue-600 hover:bg-blue-700 px-5 rounded-lg text-sm lg:text-base font-medium transition"
        >
          Hire Me
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="md:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/5 active:bg-white/10 transition"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      {/* Reading progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="h-0.5 origin-left bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#0B1120]/95 backdrop-blur-xl"
          >
            <div className="max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-1">
                {links.map((link, index) => {
                  const isActive = active === link.href.slice(1);

                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={(event) => closeAndNavigate(event, link.href)}
                      aria-current={isActive ? "page" : undefined}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + index * 0.04 }}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-base transition-colors ${
                        isActive
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-gray-300 hover:bg-white/5 hover:text-blue-400"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      )}
                    </motion.a>
                  );
                })}

                <motion.a
                  href="#contact"
                  onClick={(event) => closeAndNavigate(event, "#contact")}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 font-medium text-white shadow-lg shadow-blue-600/25 active:scale-[0.99] transition"
                >
                  Hire Me
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
