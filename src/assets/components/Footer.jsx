
import { Mail, ArrowUp } from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import { CONTACT_EMAIL } from "../lib/sendMessage";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">

        <p className="text-gray-500 text-sm">
          © {YEAR} Bora. All rights reserved.
        </p>

        <div className="flex gap-5 text-gray-400">
          <a href="https://github.com/bora4-netizen" aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/bora-chork-1bb1843a7/" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email">
            <Mail size={20} />
          </a>
          <a href="#home" aria-label="Back to top">
            <ArrowUp size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
