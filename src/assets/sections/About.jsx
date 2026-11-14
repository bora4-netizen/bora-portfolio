
import { motion } from "framer-motion";
import { Code2, GraduationCap, Lightbulb } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Parallax from "../components/Parallax";

const spring = { type: "spring", stiffness: 300, damping: 24 };

const information = [
  {
    icon: GraduationCap,
    title: "Education",
    description: "Studying Web Development.",
  },
  {
    icon: Code2,
    title: "Development",
    description: "Building frontend and backend projects.",
  },
  {
    icon: Lightbulb,
    title: "Learning",
    description: "Always exploring new technologies.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
      <Parallax
        className="absolute -top-24 right-0 pointer-events-none"
        from={40}
        to={-40}
      >
        <div className="w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </Parallax>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <SectionTitle
            title="About Me"
            subtitle="Get to know me"
          />
        </motion.div>

        <div className="grid items-center gap-8 sm:gap-14 md:grid-cols-2">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 sm:text-3xl">
              Passionate About
              <span className="text-blue-500"> Web Development</span>
            </h3>

            <p className="mb-4 text-sm leading-relaxed text-gray-400 sm:mb-5 sm:text-base">
              My name is Bora, and I am currently studying
              Web Development. I enjoy building websites
              and web applications that provide useful
              experiences for users.
            </p>

            <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
              I have experience working with frontend
              technologies and backend frameworks.
              I am continuously improving my coding,
              problem-solving, and teamwork skills.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <div className="grid gap-5">
              {information.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.12, ...spring }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:gap-5 sm:p-6"
                  >
                    <div className="rounded-xl bg-blue-500/10 p-3 sm:p-4">
                      <Icon className="text-blue-400" size={24} />
                    </div>

                    <div>
                      <h4 className="font-bold text-lg">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
