
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";

const spring = { type: "spring", stiffness: 300, damping: 24 };

const experiences = [
  {
    type: "Education",
    title: "Web Development Student",
    organization: "Web Development Program",
    period: "2025 - Present",
    description:
      "Learning frontend and backend development, databases, software development, and building practical projects.",
  },
  {
    type: "Project Experience",
    title: "Toothsy Dental Clinic",
    organization: "Web Development Project",
    period: "Project Experience",
    description:
      "Worked with Nuxt and Strapi to develop a dental clinic website.",
  },
  {
    type: "Project Experience",
    title: "Smart Locker System",
    organization: "Web Development Project",
    period: "Project Experience",
    description:
      "Worked on a locker management system using Laravel and PostgreSQL.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden py-28 px-6 bg-[#0F172A]">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <SectionTitle
            title="My Journey"
            subtitle="Education & experience"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="relative border-l-2 border-blue-500/40 ml-3 space-y-10">

            {experiences.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.16, ...spring }}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative pl-8"
              >

                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0F172A] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                <div className="relative p-6 rounded-xl border border-white/10 bg-[#111827]/60 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:bg-[#111827]/80 hover:shadow-[0_0_40px_rgba(59,130,246,0.15])">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/10 to-violet-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <p className="text-blue-400 text-sm mb-2 font-medium">
                      {item.type} · {item.period}
                    </p>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      {item.organization}
                    </p>

                    <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

              </motion.div>
            ))}

          </div>
        </motion.div>

      </div>
    </section>
  );
}
