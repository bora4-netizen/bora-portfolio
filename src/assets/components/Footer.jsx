
import { Mail, ArrowUp } from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import { CONTACT_EMAIL } from "../lib/sendMessage";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">

        <p className="text-sm text-gray-500">
          © {YEAR} Bora. All rights reserved.
        </p>

        <div className="flex gap-1 text-gray-400 sm:gap-2">
          <a
            href="https://github.com/bora4-netizen"
            aria-label="GitHub"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-blue-400"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/bora-chork-1bb1843a7/"
            aria-label="LinkedIn"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-blue-400"
          >
            <Linkedin size={20} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label="Email"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-blue-400"
          >
            <Mail size={20} />
          </a>
          <a
            href="#home"
            aria-label="Back to top"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-blue-400"
          >
            <ArrowUp size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
