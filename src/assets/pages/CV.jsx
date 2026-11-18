
import { motion } from "framer-motion";
import { Download, ArrowLeft, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

export default function CV() {
  return (
    <div className="min-h-svh overflow-x-clip bg-[#0B1120] text-white">

      <Navbar />

      <main className="overflow-x-clip pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-8"
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
              className="text-gray-400 hover:text-blue-400 transition flex items-center gap-1"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#111827] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-black/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                  Bora's CV
                </h1>
                <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">
                  Junior Web Developer
                </p>
              </div>

              <a
                href="/resume.pdf"
                download="Bora-CV.pdf"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-600/30 px-6 py-3 rounded-xl font-medium transition"
              >
                <Download size={18} />
                Download CV
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl border border-white/5 bg-[#0B1120]/40"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Email
                </h3>
                <a
                  href="mailto:chorkbora4@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  chorkbora4@gmail.com
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl border border-white/5 bg-[#0B1120]/40"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Location
                </h3>
                <p className="text-sm text-gray-300">Cambodia</p>
              </motion.div>
            </div>

            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                Summary
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                I'm a Web Development student passionate about creating modern,
                responsive, and user-friendly web applications. I enjoy learning
                new technologies and turning ideas into real projects. Open to
                internships and junior developer positions.
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-[#0B1120]/40 overflow-hidden shadow-inner">
              <embed
                src="/resume.pdf"
                type="application/pdf"
                className="w-full h-[600px] sm:h-[700px]"
              />
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm text-gray-400">
                  chorkbora4@gmail.com
                </span>
              </div>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Bora. All rights reserved.
              </p>
            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
}
