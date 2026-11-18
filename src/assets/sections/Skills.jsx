
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";
import { skills } from "../data/skills";

const spring = { type: "spring", stiffness: 300, damping: 24 };

export default function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden py-28 px-6 bg-[#0F172A]">
      <div className="relative max-w-7xl mx-auto z-10">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <SectionTitle
            title="Technical Skills"
            subtitle="What I work with"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.14, delayChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="grid sm:grid-cols-2 gap-6">
            {skills.map((group, index) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.12, ...spring }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="relative p-7 sm:p-8 rounded-2xl border border-white/10 bg-[#111827]/60 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:bg-[#111827]/80 hover:shadow-[0_0_40px_rgba(59,130,246,0.15])"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-violet-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="relative z-10 text-xl font-bold mb-6 text-blue-400">
                  {group.category}
                </h3>

                <div className="relative z-10 flex flex-wrap gap-3">
                  {group.items.map((skill, skillIdx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + skillIdx * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg text-sm text-gray-300 bg-[#1E293B]/80 border border-white/10 transition-all hover:bg-blue-600/20 hover:text-white hover:border-blue-500/40"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
