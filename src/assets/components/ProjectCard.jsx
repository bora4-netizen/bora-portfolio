
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { Github } from "./BrandIcons";

export default function ProjectCard({ project }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-[#111827] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition duration-300"
    >

      <div className="overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-3">
          {project.title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-5">
          {project.github && project.github !== "#" && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400"
            >
              <Github size={17} /> GitHub
            </a>
          )}

          {project.demo && project.demo !== "#" && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400"
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
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400"
            >
              <FileText size={17} /> Case Study
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
