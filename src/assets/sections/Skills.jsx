
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";
import { skills } from "../data/skills";

const spring = { type: "spring", stiffness: 300, damping: 24 };

export default function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden bg-[#0F172A] px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
      <div className="relative max-w-7xl mx-auto z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center"
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
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {skills.map((group, index) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.12, ...spring }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition duration-300 hover:border-blue-500/50 sm:p-7"
              >
                <h3 className="mb-4 text-lg font-bold text-blue-400 sm:mb-6 sm:text-xl">
                  {group.category}
                </h3>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {group.items.map((skill, skillIdx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + skillIdx * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-lg bg-[#1E293B] px-3 py-1.5 text-xs text-gray-300 transition hover:bg-blue-600 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
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
