
import { motion } from "framer-motion";
import SectionTitle from "../components/SectionTitle";
import Parallax from "../components/Parallax";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

export default function Projects() {
  return (
    <section id="projects" className="relative overflow-hidden py-28 px-6">
      <Parallax
        className="absolute top-1/3 -left-24 pointer-events-none"
        from={-70}
        to={70}
      >
        <div className="w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </Parallax>

      <div className="relative max-w-7xl mx-auto">

        <SectionTitle
          title="Featured Projects"
          subtitle="My recent work"
        />

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (index % 2) * 0.15 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
