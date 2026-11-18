
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";
import Parallax from "../components/Parallax";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const spring = { type: "spring", stiffness: 300, damping: 24 };

export default function Projects() {
  return (
    <section id="projects" className="relative overflow-hidden py-28 px-6">
      <Parallax
        className="absolute top-1/3 -left-24 pointer-events-none"
        from={-35}
        to={35}
      >
        <div className="w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </Parallax>

      <div className="relative max-w-7xl mx-auto z-10">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <SectionTitle
            title="Featured Projects"
            subtitle="My recent work"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.16, delayChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.14, ...spring }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
