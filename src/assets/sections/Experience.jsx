
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
    <section id="experience" className="relative overflow-hidden bg-[#0F172A] px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
      <div className="relative z-10 mx-auto max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center"
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
          <div className="relative ml-2 space-y-6 border-l-2 border-blue-500/40 sm:ml-3 sm:space-y-10">

            {experiences.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.16, ...spring }}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative pl-6 sm:pl-8"
              >

                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0F172A]" />

                <div className="bg-[#111827] border border-white/10 p-5 rounded-2xl sm:p-6">
                  <p className="mb-2 text-xs text-blue-400 sm:text-sm">
                    {item.type} · {item.period}
                  </p>

                  <h3 className="text-lg font-bold sm:text-xl">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    {item.organization}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:mt-4">
                    {item.description}
                  </p>
                </div>

              </motion.div>
            ))}

          </div>
        </motion.div>

      </div>
    </section>
  );
}
