
import { motion } from "framer-motion";
import { Code2, GraduationCap, Lightbulb } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

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
    <section id="about" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="About Me"
          subtitle="Get to know me"
        />

        <div className="grid md:grid-cols-2 gap-14 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-3xl font-bold mb-6">
              Passionate About
              <span className="text-blue-500"> Web Development</span>
            </h3>

            <p className="text-gray-400 leading-relaxed mb-5">
              My name is Bora, and I am currently studying
              Web Development. I enjoy building websites
              and web applications that provide useful
              experiences for users.
            </p>

            <p className="text-gray-400 leading-relaxed">
              I have experience working with frontend
              technologies and backend frameworks.
              I am continuously improving my coding,
              problem-solving, and teamwork skills.
            </p>
          </motion.div>

          <div className="grid gap-5">
            {information.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="bg-[#111827] border border-white/10 p-6 rounded-xl flex gap-5 items-center"
                >
                  <div className="bg-blue-500/10 p-4 rounded-lg">
                    <Icon className="text-blue-400" size={28} />
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

        </div>
      </div>
    </section>
  );
}
