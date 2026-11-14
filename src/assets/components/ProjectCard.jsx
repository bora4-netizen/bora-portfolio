
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { Github } from "./BrandIcons";

const spring = { type: "spring", stiffness: 300, damping: 22 };

export default function ProjectCard({ project }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition duration-300 hover:border-blue-500/50"
    >

      <div className="overflow-hidden">
        <motion.img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="h-44 w-full object-cover sm:h-52"
        />
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="mb-2.5 text-lg font-bold sm:mb-3 sm:text-xl">
          {project.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-gray-400 sm:mb-5">
          {project.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
          {project.technologies.map((tech) => (
            <motion.span
              key={tech}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[0.7rem] text-blue-400 sm:px-3 sm:text-xs"
            >
              {tech}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {project.github && project.github !== "#" && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="flex min-h-11 items-center gap-2 text-sm text-gray-300 transition hover:text-blue-400"
            >
              <Github size={17} /> GitHub
            </a>
          )}

          {project.demo && project.demo !== "#" && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="flex min-h-11 items-center gap-2 text-sm text-gray-300 transition hover:text-blue-400"
            >
              <ExternalLink size={17} /> Live Demo
            </a>
          )}

          {project.caseStudy && (
            <a
              href={project.caseStudy}
              target="_blank"
              rel="noreferrer"
              download
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="flex min-h-11 items-center gap-2 text-sm text-gray-300 transition hover:text-blue-400"
            >
              <FileText size={17} /> Case Study
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
