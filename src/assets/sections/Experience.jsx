
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";

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
    <section id="experience" className="py-28 px-6 bg-[#0F172A]">
      <div className="max-w-4xl mx-auto">

        <SectionTitle
          title="My Journey"
          subtitle="Education & experience"
        />

        <div className="relative border-l-2 border-blue-500/40 ml-3 space-y-10">

          {experiences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative pl-8"
            >

              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0F172A]" />

              <div className="bg-[#111827] border border-white/10 p-6 rounded-xl">
                <p className="text-blue-400 text-sm mb-2">
                  {item.type} · {item.period}
                </p>

                <h3 className="text-xl font-bold">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  {item.organization}
                </p>

                <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}
