
import { Mail, ArrowUp } from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import { CONTACT_EMAIL } from "../lib/sendMessage";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative px-4 py-10 sm:px-6 sm:py-14 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left md:gap-10">
        <div className="flex items-center gap-2">
          <img
            src="/logos/logo.png"
            alt="Bora logo"
            className="h-10 sm:h-12 w-auto"
          />
        </div>

        <p className="text-sm text-gray-500">
          © {YEAR} Bora. All rights reserved.
        </p>

        <div className="flex gap-2 sm:gap-3 text-gray-400">
          <a
            href="https://github.com/bora4-netizen"
            aria-label="GitHub"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-blue-500/40 hover:text-blue-400 hover:-translate-y-1"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/bora-chork-1bb1843a7/"
            aria-label="LinkedIn"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-blue-500/40 hover:text-blue-400 hover:-translate-y-1"
          >
            <Linkedin size={20} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label="Email"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-blue-500/40 hover:text-blue-400 hover:-translate-y-1"
          >
            <Mail size={20} />
          </a>
          <a
            href="#home"
            aria-label="Back to top"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-blue-500/40 hover:text-blue-400 hover:-translate-y-1"
          >
            <ArrowUp size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
