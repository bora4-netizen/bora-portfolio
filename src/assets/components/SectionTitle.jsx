
import { motion } from "framer-motion";

export default function SectionTitle({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.7 }}
      className="mb-10 text-center sm:mb-14"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-3 text-xs uppercase tracking-[3px] text-cyan-400 sm:text-sm sm:tracking-[4px]"
      >
        {subtitle}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.8, delay: 0.28, ease: "easeOut" }}
        className="mx-auto mt-4 h-1 w-16 origin-center rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.6)] sm:mt-5 sm:w-20"
      />
    </motion.div>
  );
}
